import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { parseMonthRoute } from "../lib/monthRoute";

export const useInitialDiaryDate = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  return useMemo(
    () => parseMonthRoute(year, month) ?? new Date(),
    [year, month],
  );
};
