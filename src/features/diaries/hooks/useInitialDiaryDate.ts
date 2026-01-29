import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useInitialDiaryDate = () => {
  const { dateParamString } = useParams<{ dateParamString: string }>();

  return useMemo(() => {
    if (!dateParamString) return new Date();
    const parsedDate = new Date(dateParamString);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [dateParamString]);
};
