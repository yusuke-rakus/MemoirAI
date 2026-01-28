import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useInitialDiaryDate = () => {
  const { date } = useParams<{ date: string }>();

  return useMemo(() => {
    if (!date) return new Date();
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [date]);
};
