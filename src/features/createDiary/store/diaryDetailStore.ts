import { createStore } from "zustand/vanilla";

import type { Diary } from "@/types/diary/diary";

export type DiaryDetailState = {
  date: Date;
  setDate: (date: Date) => void;
  uploadedDiaries: Diary[];
  setUploadedDiaries: (diaries: Diary[]) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
};

export const createDiaryDetailStore = (initialDate: Date) =>
  createStore<DiaryDetailState>((set) => ({
    date: initialDate,
    uploadedDiaries: [],
    isLoading: false,
    setDate: (date) => set({ date }),
    setUploadedDiaries: (diaries) => set({ uploadedDiaries: diaries }),
    setIsLoading: (v: boolean) => set({ isLoading: v }),
  }));
