import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import {
  createDiaryDetailStore,
  type DiaryDetailState,
} from "../store/diaryDetailStore";

const DiaryDetailStoreContext =
  createContext<StoreApi<DiaryDetailState> | null>(null);

type Props = {
  children: ReactNode;
};

export const DiaryDetailProvider = ({ children }: Props) => {
  const storeRef = useRef<StoreApi<DiaryDetailState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createDiaryDetailStore();
  }

  return (
    <DiaryDetailStoreContext.Provider value={storeRef.current}>
      {children}
    </DiaryDetailStoreContext.Provider>
  );
};

export const useDiaryDetailStore = (): DiaryDetailState => {
  const store = useContext(DiaryDetailStoreContext);
  if (!store) {
    throw new Error(
      "useDiaryDetailStore must be used within DiaryDetailProvider",
    );
  }

  return useStore(store);
};
