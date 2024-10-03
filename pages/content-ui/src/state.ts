import { create } from 'zustand';
import { sendMessage } from '@src/extensonWrapper';
// import type { Tab } from '@types/chrome'

type BookmarkDialog = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
};

type TabManagerType = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
  tabs: chrome.tabs.Tab[];
};
export const useTabDialogState = create<TabManagerType>(() => ({
  isOpen: true,
  isUpload: false,
  progress: 0,
  tabs: [],
}));
export const setTabDialogState = (state: Partial<TabManagerType>) => {
  useTabDialogState.setState({ ...useTabDialogState.getState(), ...state });
};
export const useBookmarkDialogState = create<BookmarkDialog>(() => ({
  // todo
  isOpen: false,
  isUpload: false,
  progress: 0,
}));

export const setBookmarkDialogState = (state: Partial<BookmarkDialog>) => {
  useBookmarkDialogState.setState({ ...useBookmarkDialogState.getState(), ...state });
};
type StorageType = { [key: string]: string };

export const useStorageState = create<StorageType>(() => ({}));

export async function createStorage() {
  const storage: StorageType = (await sendMessage({ greeting: 'getStorage' })) as StorageType;
  useStorageState.setState({ ...(storage as StorageType) });
}

export async function jump2Tab(tab: chrome.tabs.Tab) {
  await sendMessage({ greeting: 'jump2Tab', tab });
  // useStorageState.setState({ ...(storage as StorageType) });
}
export async function getAllTabs() {
  const tabs = (await sendMessage({ greeting: 'getAllTabs' })) as chrome.tabs.Tab[];
  console.log({ tabs });
  setTabDialogState({ tabs });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log({ request });
  switch (request.message) {
    case '打开书签面板':
      setBookmarkDialogState({ isOpen: true });
      break;
    case 'TabsManager':
      setTabDialogState({ isOpen: true });
      break;
    case 'getStorage':
      useStorageState.setState({ ...(request.storage as StorageType) });
      break;
    case 'tabAssistant':
      setTabDialogState({ tabs: request.tabs, isOpen: true });
      break;
  }
});
