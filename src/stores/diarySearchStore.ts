import type { Diary } from "@/types/diary/diary";
import { create } from "zustand";

type DiarySearchState = {
  open: boolean;
  cachedUid: string | null;
  diaries: Diary[];
  setOpen: (open: boolean) => void;
  setCache: (uid: string, diaries: Diary[]) => void;
  invalidate: () => void;
};

export const useDiarySearchStore = create<DiarySearchState>((set) => ({
  open: false,
  cachedUid: null,
  diaries: [],
  setOpen: (open) => set({ open }),
  setCache: (cachedUid, diaries) => set({ cachedUid, diaries }),
  invalidate: () => set({ cachedUid: null, diaries: [] }),
}));

export const invalidateDiarySearchCache = () =>
  useDiarySearchStore.getState().invalidate();
