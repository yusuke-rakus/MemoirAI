import { createStore } from "zustand/vanilla";

import type { Diary } from "@/types/diary/diary";

export type DiaryDetailState = {
  uploadedDiaries: Diary[];
  setUploadedDiaries: (diaries: Diary[]) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
};

export const createDiaryDetailStore = () =>
  createStore<DiaryDetailState>((set) => ({
    uploadedDiaries: [],
    isLoading: false,
    setUploadedDiaries: (diaries) => set({ uploadedDiaries: diaries }),
    setIsLoading: (v: boolean) => set({ isLoading: v }),
  }));
