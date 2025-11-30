import { createStore } from "zustand/vanilla";

export type CurrentDateState = {
  date: Date;
  setDate: (date: Date) => void;
};

export const createCurrentDateStore = (initialDate: Date) =>
  createStore<CurrentDateState>((set) => ({
    date: initialDate,
    setDate: (date) => set({ date }),
  }));
