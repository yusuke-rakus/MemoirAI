import { useLocation, useNavigate } from "react-router-dom";

export type Month = { label: string; date: Date; isButton: boolean };

export const useSetMonthRouteParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (month: Month, replace = false) => {
    const base = location.pathname.startsWith("/diaries")
      ? "/diaries"
      : "/calendar";
    navigate(
      `${base}/${month.date.getFullYear()}/${month.date.getMonth() + 1}`,
      { replace },
    );
  };
};
