import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useInitialDiaryDate = () => {
  const params = useParams<{ year: string; month: string }>();

  const resolvedYear = params.year;
  const resolvedMonth = params.month;

  return useMemo(() => {
    if (resolvedYear && resolvedMonth) {
      const y = Number(resolvedYear);
      const m = Number(resolvedMonth);
      if (
        !Number.isNaN(y) &&
        !Number.isNaN(m) &&
        Number.isInteger(y) &&
        m >= 1 &&
        m <= 12
      ) {
        return new Date(y, m - 1, 1);
      }
    }

    if (resolvedMonth) {
      const parsed = new Date(resolvedMonth);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    if (resolvedYear) {
      const y = Number(resolvedYear);
      if (!Number.isNaN(y) && Number.isInteger(y)) return new Date(y, 0, 1);
    }

    return new Date();
  }, [resolvedYear, resolvedMonth]);
};
