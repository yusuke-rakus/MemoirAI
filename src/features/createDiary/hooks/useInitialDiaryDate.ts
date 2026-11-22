import { parseISO } from "date-fns";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useInitialDiaryDate = () => {
  const { date } = useParams<{ date: string }>();

  return useMemo(() => {
    if (!date) return new Date();
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? parseISO(date)
      : new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [date]);
};
