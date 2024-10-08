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
  tabsWithFavIcon.sort((a, b) => {
    return (b.lastAccessed || 0) - (a.lastAccessed || 0);
  });
  return tabsWithFavIcon;
}

export const tabDataPrepare = () => {
  getAllTabs().then(tabs => {
    canvasAllTabs(tabs);
  });
};

export async function activeTab() {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab;
}

export async function canvasAllTabs(tabs: chrome.tabs.Tab[]) {
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, { message: 'html2canvas', tab });
  }
  getAllTabs().then(async tabs => {
    const localKeys = Object.keys(await chrome.storage.local.get());
    for (const tab of tabs) {
      const tabId = tab?.id?.toString();
      if (!tabId || localKeys.includes(tabId)) {
        continue;
      }
      chrome.storage.local.remove(tabId);
      console.log('remove', { tabId });
    }
  });
  return tabs;
}

export async function jump2Tab(tab: chrome.tabs.Tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
}
