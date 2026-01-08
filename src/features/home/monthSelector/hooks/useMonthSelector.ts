import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCurrentDateStore } from "../../provider/CurrentDateProvider";

export type Month = {
  label: string;
  date: Date;
  isButton: boolean;
};

/**
 * 年月のスクロールバーを初期化するカスタムフック
 */
export const useMonths = () => {
  const [months, setMonths] = useState<Month[]>([]);

  const generateNext12Months = (now: Date) => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i);
      const label = `${date.getMonth() + 1}月`;
      result.push({ label, date, isButton: true });
      if (date.getMonth() === 0) {
        result.push({
          label: date.getFullYear().toString(),
          date: date,
          isButton: false,
        });
      }
    }
    return result.reverse();
  };

  useEffect(() => {
    setMonths(generateNext12Months(new Date()));
  }, []);

  return months;
};

/**
 * ルートのパスパラメータ `:year` と `:month` を更新するフック。
 * - 現在のパスに `:year` と `:month` が存在する場合は置換する。
 * - 存在しない場合は現在のパスの末尾に `/{year}/{month}` を追加する。
 */
export const useSetMonthRouteParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDate } = useCurrentDateStore();
  const params = useParams<{ year?: string; month?: string }>();

  const setMonthRouteParams = (month: Month, replace = false) => {
    const targetYear = month.date.getFullYear().toString();
    const targetMonth = (month.date.getMonth() + 1).toString();

    const currentPath = location.pathname;

    setDate(month.date);

    if (params.year && params.month) {
      let newPath = currentPath.replace(params.year, targetYear);
      newPath = newPath.replace(params.month, targetMonth);
      navigate(newPath, { replace });
      return;
    }

    const base = currentPath.endsWith("/")
      ? currentPath.slice(0, -1)
      : currentPath;
    navigate(`${base}/${targetYear}/${targetMonth}`, { replace });
  };

  return setMonthRouteParams;
};

/**
 * 指定された要素がマウントされた際に、その要素をビューの中央にスクロールするカスタムフック
 * @param ref スクロール対象の要素へのRefObject
 * @param dependencies スクロールを再トリガーするための依存配列
 */
export const useScrollToCurrentMonth = () => {
  const currentMonthRef = useRef<HTMLButtonElement | null>(null);

  const setScrollToCurrentMonth = (
    ref: RefObject<HTMLButtonElement | null>,
    dependencies: Month[] = []
  ) => {
    useEffect(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, [dependencies]);
  };
  return { currentMonthRef, setScrollToCurrentMonth };
};
