import { create } from "zustand";

export type InitialDateState = {
  date: Date;
  dateParamString: string;
  yearMonth: { year: number; month: string };
  setDate: (date: Date) => void;
};

export const useInitialDateStore = create<InitialDateState>((set, get) => {
  const computeDateParamString = (date: Date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

  const computeYearMonth = (date: Date) => ({
    year: date.getFullYear(),
    month: String(date.getMonth() + 1),
  });

  const initialDate = new Date();

  return {
    date: initialDate,
    dateParamString: computeDateParamString(initialDate),
    yearMonth: computeYearMonth(initialDate),
    setDate: (newDate: Date) => {
      set({
        date: newDate,
        dateParamString: computeDateParamString(newDate),
        yearMonth: computeYearMonth(newDate),
      });
    },
  };
});
