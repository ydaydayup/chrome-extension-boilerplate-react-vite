import { create } from 'zustand';

// import {create as createVanilla} from 'zustand/vanilla';
const step = 32;

type BookmarkDialog = {
  isOpen: boolean;
};

export const useBookmarkDialogState = create<BookmarkDialog>(() => ({
  // todo
  isOpen: false,
  // isOpen: true,
}));

export const setBookmarkDialogState = (state: BookmarkDialog) => {
  useBookmarkDialogState.setState({ ...useBookmarkDialogState.getState(), ...state });
};
