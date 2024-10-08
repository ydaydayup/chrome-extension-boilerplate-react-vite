export async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  const tabs = await chrome.tabs.query({});
  tabs.sort((a, b) => {
    return (b.lastAccessed || 0) - (a.lastAccessed || 0);
  });
  return tabs;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status !== 'complete') {
    return;
  }
  getAllTabs();
});

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
