import { create, UseBoundStore } from 'zustand';
import { sendMessage } from '@src/extensonWrapper';
import _ from 'lodash-es';
type BookmarkDialog = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
};
type TabId = chrome.tabs.Tab['id'];

type NewTab = chrome.tabs.Tab & { favIconURL?: string; windowGroup?: number };
type TabManagerType = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
  tabs: NewTab[];
  preview: string;
  tabCanvas: { TabId?: { dataURL: string } };
  previewId: number | null;
  previewTitle: string;
  previewUrl: string;
  // url: string,
};

type CommonDialogStateType = {
  activeTab: chrome.tabs.Tab | null;
};
export const commonDialogState = create<CommonDialogStateType>(() => ({
  activeTab: null,
}));

// 工具函数：更新状态并进行相等性检查
// store: Zustand store 实例
// newPartialState: 新的部分状态
export const updateStateWithCheck = <T extends object>(store: UseBoundStore<T>, newPartialState: Partial<T>): void => {
  const oldState = store.getState();
  const newState = { ...oldState, ...newPartialState };
  console.log('updateStateWithCheck before', oldState, newState);
  // 使用 lodash 的 isEqual 进行深度比较
  if (_.isEqual(oldState, newState)) {
    return;
  }
  console.log('updateStateWithCheck after', oldState, newState);
  store.setState(newState);
};

export const setCommonDialogState = (state: Partial<CommonDialogStateType>) => {
  updateStateWithCheck(commonDialogState, state);
};

export const useTabDialogState = create<TabManagerType>(() => ({
  isOpen: false,
  isUpload: false,
  progress: 0,
  tabs: [],
  preview: '',
  tabCanvas: {},
  previewId: null,
  previewTitle: '',
  previewUrl: '',
}));

export const setTabDialogState = (state: Partial<TabManagerType>) => {
  updateStateWithCheck(useTabDialogState, state);
};
export const useBookmarkDialogState = create<BookmarkDialog>(() => ({
  isOpen: false,
  isUpload: false,
  progress: 0,
}));

export const setBookmarkDialogState = (state: Partial<BookmarkDialog>) => {
  updateStateWithCheck(useBookmarkDialogState, state);
};
type StorageType = { syncStorage?: { [p: string]: any }; localStorage?: { [p: string]: any } };

export const useStorageState = create<StorageType>(() => ({}));

export async function createStorage() {
  const storage: StorageType = (await sendMessage({ greeting: 'getStorage' })) as StorageType;
  updateStateWithCheck(useStorageState, storage);
  return storage;
}

export async function jump2Tab(tab: chrome.tabs.Tab) {
  await sendMessage({ greeting: 'jump2Tab', tab });
}

export const removeTab = async (tabId: TabId) => {
  await sendMessage({ greeting: 'removeTab', tabId });
};

export async function getActiveTab(): Promise<chrome.tabs.Tab> {
  console.log('getActiveTab run');
  const activeTab = (await sendMessage({ greeting: 'getActiveTab' })) as chrome.tabs.Tab;
  setCommonDialogState({ activeTab });
  return activeTab;
}

export const initializeTabs = async () => {
  const tabs = (await sendMessage({ greeting: 'getAllTabs' })) as NewTab[];
  // const tabs = request.tabs as NewTab[];
  const windowId = new Map<number, number>();
  let windowNumber = 0;
  for (const tab of tabs) {
    if (!windowId.has(tab.windowId)) {
      windowNumber++;
      windowId.set(tab.windowId, windowNumber);
    }
    tab['windowGroup'] = windowId.get(tab.windowId);
  }
  setTabDialogState({ tabs: tabs, isOpen: true });
  // setTabDialogState({});

  await createStorage();
};
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log({ request });
  switch (request.message) {
    case '打开书签面板':
      setBookmarkDialogState({ isOpen: true });
      break;
    // case 'TabsManager':
    //   setTabDialogState({ isOpen: true });
    //   break;
    // case 'getStorage':
    //   console.log('getStoragegetStorage', request.storage)
    //   useStorageState.setState({ ...request.storage });
    //   break;
    case 'initializeTabs':
      initializeTabs();
      break;
    case 'tabAssistant': {
      const tabs = request.tabs as NewTab[];
      const windowId = new Map<number, number>();
      let windowNumber = 0;
      for (const tab of tabs) {
        if (!windowId.has(tab.windowId)) {
          windowNumber++;
          windowId.set(tab.windowId, windowNumber);
        }
        tab['windowGroup'] = windowId.get(tab.windowId);
      }
      setTabDialogState({ tabs: request.tabs, isOpen: true });
      break;
    }
  }
});
