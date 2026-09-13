import { create } from "zustand";

type DiarySearchState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useDiarySearchStore = create<DiarySearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
