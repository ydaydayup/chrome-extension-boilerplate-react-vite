import { create } from 'zustand';
import { sendMessage } from '@src/extensonWrapper';
import { canvas2htmlSaver } from '@src/screenshot';
// import type { Tab } from '@types/chrome'

type BookmarkDialog = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
};
type TabId = chrome.tabs.Tab['id'];

type NewTab = chrome.tabs.Tab & { favIconURL?: string };
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
};

type CommonDialogStateType = {
  activeTab: chrome.tabs.Tab | null;
};
export const commonDialogState = create<CommonDialogStateType>(() => ({
  activeTab: null,
}));

export const setCommonDialogState = (state: Partial<CommonDialogStateType>) => {
  commonDialogState.setState({ ...commonDialogState.getState(), ...state });
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
  useTabDialogState.setState({ ...useTabDialogState.getState(), ...state });
};
export const useBookmarkDialogState = create<BookmarkDialog>(() => ({
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
    case 'html2canvas':
      canvas2htmlSaver(request.tab);
      break;
  }
});
