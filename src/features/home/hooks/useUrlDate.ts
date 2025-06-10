import { useSearchParams } from "react-router-dom";
import { QueryDateParam } from "../constants/queryDateParam";

export const useUrlDate = () => {
  const [searchParams] = useSearchParams();

  const yearParam = searchParams.get(QueryDateParam.Year);
  const monthParam = searchParams.get(QueryDateParam.Month);

  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = today.getMonth();

  const year = yearParam ? Number(yearParam) : defaultYear;
  const month = monthParam ? Number(monthParam) - 1 : defaultMonth;

  return new Date(year, month, 1);
};
