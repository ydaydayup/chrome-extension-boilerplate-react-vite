import { TabId } from '@src/background/types';

/**
 * If the given tabId exists in chrome storage, return the corresponding item.
 * Otherwise, create a new item with the given tabId and save it to chrome storage.
 * @param tabId the id of the tab to check
 * @param uniqueId
 * @param replace true 表示强制替换，false表示当uniqueId存在不替换
 * @returns uniqueId不存在返回新设置的tabid，存在返回已经设置好的tabid
 */
export async function getOrSetCurrentTab(tabId: TabId, uniqueId: string, replace = true) {
  if (replace) {
    chrome.storage.local.set({ [uniqueId]: { tabId: tabId } });
    return tabId;
  }
  const result = await chrome.storage.local.get([uniqueId]);

  if (result[uniqueId]) {
    // 存在
    return result[uniqueId]['tabId'];
  }
  chrome.storage.local.set({ [uniqueId]: { tabId: tabId } });
  return tabId;
}
// const sendStorageMessage=async (tab: chrome.tabs.Tab) => {
//   const storage = await getStorage();
//   chrome.tabs.sendMessage(tab.id!, { message: 'getStorage', storage: storage });
// };
