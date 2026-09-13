import { createStore } from "zustand/vanilla";

export type DiaryDetailState = {
  date: Date;
  setDate: (date: Date) => void;
};

export const createDiaryDetailStore = (initialDate: Date) =>
  createStore<DiaryDetailState>((set) => ({
    date: initialDate,
    setDate: (date) => set({ date }),
  }));
