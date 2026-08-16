import { create } from "zustand";

type FavoriteRefreshState = {
  revision: number;
  requestRefresh: () => void;
};

export const useFavoriteRefreshStore = create<FavoriteRefreshState>((set) => ({
  revision: 0,
  requestRefresh: () =>
    set((state) => ({
      revision: state.revision + 1,
    })),
}));

export const requestFavoriteRefresh = () =>
  useFavoriteRefreshStore.getState().requestRefresh();
