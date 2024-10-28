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

export const tabDataPrepare = () => {
  getAllTabs().then(tabs => {
    canvasAllTabs(tabs);
  });
};
type TabId = chrome.tabs.Tab['id'];
export const removeTab = async (tabId: TabId) => {
  return chrome.tabs.remove(tabId!);
};

export async function activeTab() {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab;
}

export async function canvasAllTabs(tabs: chrome.tabs.Tab[]) {
  for (const tab of tabs) {
    if (!tab.active) continue;
    chrome.tabs.sendMessage(tab.id!, { message: 'html2canvas', tab });
  }
  getAllTabs().then(async tabs => {
    const localKeys = Object.keys(await chrome.storage.local.get());
    const newTabs = tabs.length > 100 ? tabs.slice(0, tabs.length - 100) : [];
    for (const tab of newTabs) {
      const tabId = tab?.id?.toString();
      if (!tabId || localKeys.includes(tabId)) {
        continue;
      }
      chrome.storage.local.remove(tabId!);
      console.log('remove', { tabId });
    }
  });
  return tabs;
}

export async function jump2Tab(tab: chrome.tabs.Tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
}

async function canvas2htmlSaver(tabId: TabId, dataURL) {
  chrome.storage.local.set({ [tabId as number]: { dataURL: dataURL } });
}

function capturePage(activeInfo: chrome.tabs.TabActiveInfo) {
  console.log('Capture Visible Tab; ', activeInfo);
  setTimeout(function () {
    chrome.tabs.captureVisibleTab({ format: 'png' }, function (dataUrl) {
      console.log({ dataUrl });
      if (!dataUrl) {
        return;
      }
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }
      canvas2htmlSaver(activeInfo.tabId, dataUrl);
    });
  }, 100);
  // activeTab().then(tab => {
  //   // https://www.cjavapy.com/article/1978/
  //   setTimeout(function() {
  //     chrome.tabs.captureVisibleTab({ format: 'png' }, function(dataUrl) {
  //       console.log({ dataUrl });
  //       if (!dataUrl) {
  //         return;
  //       }
  //       if (chrome.runtime.lastError) {
  //         console.log(chrome.runtime.lastError);
  //         return;
  //       }
  //       canvas2htmlSaver(activeInfo.tabId, dataUrl);
  //     });
  //
  //   }, 100);
  // });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log({ activeInfo });
  capturePage(activeInfo);
});

chrome.tabs.onZoomChange.addListener(function (ZoomChangeInfo) {
  console.log({ ZoomChangeInfo });
  capturePage(ZoomChangeInfo);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log({ changeInfo });
  if (changeInfo.status !== 'complete') {
    return;
  }
  capturePage(tab);
});
