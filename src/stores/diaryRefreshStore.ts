import { create } from "zustand";

type DiaryRefreshState = {
  revision: number;
  requestRefresh: () => void;
};

export const useDiaryRefreshStore = create<DiaryRefreshState>((set) => ({
  revision: 0,
  requestRefresh: () =>
    set((state) => ({
      revision: state.revision + 1,
    })),
}));

export const requestDiaryRefresh = () =>
  useDiaryRefreshStore.getState().requestRefresh();
