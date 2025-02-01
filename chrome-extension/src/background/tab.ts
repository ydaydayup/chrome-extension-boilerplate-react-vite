import { TabId } from '@src/background/types';
import { panelState } from '@src/background/state';

function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', u); // this encodes the URL as well
  url.searchParams.set('size', '32');
  return url.toString();
}

type NewTab = chrome.tabs.Tab & { favIconURL?: string };

export async function getAllTabs(): Promise<NewTab[]> {
  const tabs = await chrome.tabs.query({});
  const tabsWithFavIcon: NewTab[] = tabs.map(tab => {
    return { ...tab, favIconURL: faviconURL(tab.url) } as NewTab;
  });
  // tabsWithFavIcon.sort((a, b) => {
  //   return (b.lastAccessed || 0) - (a.lastAccessed || 0);
  // });
  return tabsWithFavIcon;
}

export const tabDataPrepare = async () => {
  await cleanStorage();
};

export const removeTab = async (tabId: TabId) => {
  return chrome.tabs.remove(tabId!);
};

export async function activeTab() {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab;
}

export const cleanStorage = async () => {
  const tabs = await getAllTabs(); // Get tabs first
  const localKeys = Object.keys(await chrome.storage.local.get());
  const openTabIds = tabs.map(tab => tab.id?.toString());
  const tabsToRemove = localKeys.filter(tabId => {
    return !openTabIds.includes(tabId);
  });

  console.log({ tabsToRemove });
  for (const tabId of tabsToRemove) {
    await chrome.storage.local.remove(tabId.toString());
    console.log('remove', { tabId: tabId });
  }
  // }
};

export async function jump2Tab(tab: chrome.tabs.Tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
}

async function canvas2htmlSaver(tabId: TabId, dataURL) {
  console.log('[Tab Saver]', { tabId, dataURL });
  chrome.storage.local.set({ [tabId as number]: { dataURL: dataURL } });
}

const MIN_CAPTURE_INTERVAL = 500;

/**
 * Capture the visible tab and save it to local storage. 由于是异步的，所以需要等待一段时间再执行。所以截图可能不是正确的页面
 * @param activeInfo The activeInfo object returned by the chrome.tabs.onActivated event.
 * @returns A promise that resolves when the capture is complete.
 */
async function capturePage(activeInfo: chrome.tabs.TabActiveInfo) {
  console.log('Capture Visible Tab; ', activeInfo);

  // 如果当前activeInfo的tabid和当前活跃的不一致，就直接返回
  const isActiveTab = async () => {
    return activeInfo.tabId === (await activeTab())?.id;
  };
  setTimeout(async function () {
    if (!(await isActiveTab())) {
      return;
    }
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
      if (!dataUrl) {
        return;
      }
      if (!(await isActiveTab())) {
        return;
      }
      console.log('[Tab Saver]', panelState.panelId, (await activeTab()).windowId), chrome.runtime.getURL('');
      if (panelState.panelId === (await activeTab()).windowId) {
        return;
      }
      await canvas2htmlSaver(activeInfo.tabId, dataUrl);
      await cleanStorage(); // Call cleanStorage after successful capture
    } catch (error) {
      console.error('Error capturing page:', error);
    }
  }, MIN_CAPTURE_INTERVAL);
}

// 添加一个防抖计时器映射
const debounceTimers: { [key: number]: NodeJS.Timeout } = {};

// 创建一个防抖包装函数
function debouncedCapturePage(tabInfo: chrome.tabs.TabActiveInfo | chrome.tabs.Tab) {
  const tabId = 'tabId' in tabInfo ? tabInfo.tabId : tabInfo.id;

  if (!tabId) {
    console.log('[Capture Debounce]', {
      event: 'skip_capture',
      reason: 'no_tab_id',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 清除之前的定时器
  if (debounceTimers[tabId]) {
    clearTimeout(debounceTimers[tabId]);
  }

  // 设置新的定时器，1秒后执行
  debounceTimers[tabId] = setTimeout(() => {
    capturePage(tabInfo);
    delete debounceTimers[tabId];
  }, 500);
}

// 添加一个跟踪当前活动标签页的变量
let currentActiveTabId: number | null = null;
let captureInterval: NodeJS.Timeout | null = null;

// 启动定期捕获
function startPeriodicCapture(tabId: number) {
  console.log('[Tab Event]', { tabId });
  // 如果已经在捕获这个标签页，不需要重新启动
  if (currentActiveTabId === tabId && captureInterval) {
    return;
  }

  // 清除之前的定时器
  if (captureInterval) {
    clearInterval(captureInterval);
  }

  // 更新当前活动标签页
  currentActiveTabId = tabId;

  // 设置新的定时器
  captureInterval = setInterval(() => {
    console.log('[Periodic Capture]', {
      event: 'auto_capture',
      tabId: currentActiveTabId,
      timestamp: new Date().toISOString(),
    });

    if (currentActiveTabId) {
      debouncedCapturePage({ tabId: currentActiveTabId });
    }
  }, 1000); // 每秒执行一次
}

// 停止定期捕获
function stopPeriodicCapture() {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }
  currentActiveTabId = null;
}

// 修改 onActivated 监听器
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log('[Tab Event]', {
    event: 'activated',
    activeInfo,
    timestamp: new Date().toISOString(),
  });
  console.log('[Tab Event]', { activeInfo });
  // 立即执行一次捕获
  debouncedCapturePage(activeInfo);

  // 启动定期捕获
  startPeriodicCapture(activeInfo.tabId);
});

// 当标签页关闭时停止捕获
chrome.tabs.onRemoved.addListener(tabId => {
  if (currentActiveTabId === tabId) {
    stopPeriodicCapture();
  }
});

// 当窗口失去焦点时停止捕获
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopPeriodicCapture();
  } else {
    // 当窗口重新获得焦点时，获取当前活动标签页并重新开始捕获
    chrome.tabs.query({ active: true, windowId }, tabs => {
      if (tabs[0]?.id) {
        startPeriodicCapture(tabs[0].id);
      }
    });
  }
});

chrome.tabs.onZoomChange.addListener(function (ZoomChangeInfo) {
  console.log('[Tab Event]', {
    event: 'zoom_change',
    ZoomChangeInfo,
    timestamp: new Date().toISOString(),
  });
  debouncedCapturePage(ZoomChangeInfo);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('[Tab Event]', {
    event: 'updated',
    changeInfo,
    timestamp: new Date().toISOString(),
  });
  if (changeInfo.status !== 'complete') {
    return;
  }
  debouncedCapturePage(tab);
});

export const getExtensionIndex = () => {
  return chrome.runtime.getURL('content-ui/index.html');
  // return chrome.runtime.getManifest().short_name;
};
