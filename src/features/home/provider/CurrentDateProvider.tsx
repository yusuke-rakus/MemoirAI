import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import {
  createCurrentDateStore,
  type CurrentDateState,
} from "../store/currentDateStore";

const CurrentDateStoreContext =
  createContext<StoreApi<CurrentDateState> | null>(null);

type Props = {
  initialDate: Date;
  children: ReactNode;
};

export const CurrentDateProvider = ({ initialDate, children }: Props) => {
  const storeRef = useRef<StoreApi<CurrentDateState> | null>(null);

  if (!storeRef.current && initialDate) {
    storeRef.current = createCurrentDateStore(initialDate);
  }

  return (
    <CurrentDateStoreContext.Provider value={storeRef.current}>
      {children}
    </CurrentDateStoreContext.Provider>
  );
};

export const useCurrentDateStore = (): CurrentDateState => {
  const store = useContext(CurrentDateStoreContext);
  if (!store) {
    throw new Error(
      "useCurrentDateStore must be used within CurrentDateProvider"
    );
  }

  return useStore(store);
};
