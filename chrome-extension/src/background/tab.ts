import { TabId } from '@src/background/types';

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
  // const tabs = await getAllTabs();
  // return tabs;
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
    // const tabId = tab?.id?.toString();
    return !openTabIds.includes(tabId);
    // return tabId && !localKeys.includes(tabId);
  });
  // Filter out tabs that need to be removed
  // const tabsToRemove = tabs.filter(tab => {
  //   const tabId = tab?.id?.toString();
  //   return tabId && !localKeys.includes(tabId);
  // });

  // Remove tabs from storage
  console.log({ tabsToRemove });
  for (const tabId of tabsToRemove) {
    // if (tab.id) {
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
  chrome.storage.local.set({ [tabId as number]: { dataURL: dataURL } });
}
const MIN_CAPTURE_INTERVAL = 500;
function capturePage(activeInfo: chrome.tabs.TabActiveInfo) {
  console.log('Capture Visible Tab; ', activeInfo);
  setTimeout(async function () {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
      if (!dataUrl) {
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
  }, 1000);
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log('[Tab Event]', {
    event: 'activated',
    activeInfo,
    timestamp: new Date().toISOString(),
  });
  debouncedCapturePage(activeInfo);
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
