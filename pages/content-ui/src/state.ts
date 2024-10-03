import { create } from 'zustand';
import { sendMessage } from '@src/extensonWrapper';

// import {create as createVanilla} from 'zustand/vanilla';

type BookmarkDialog = {
  isOpen: boolean;
  isUpload: boolean;
  progress: number;
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.message) {
    case '打开书签面板':
      setBookmarkDialogState({ isOpen: true });
      break;
    case 'getStorage':
      useStorageState.setState({ ...(request.storage as StorageType) });
      break;
  }
});
