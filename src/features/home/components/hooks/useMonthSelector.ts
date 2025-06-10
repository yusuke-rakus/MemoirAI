import { useEffect, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryDateParam } from "../../constants/queryDateParam";

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
 * 選択された年月をURLのクエリパラメータに設定するカスタムフック
 * @param month クエリパラメータとして設定したい月データを含むオブジェクト
 */
export const useSetMonthQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setMonthQueryParams = (month: Month) => {
    const targetYear = month.date.getFullYear().toString();
    const targetMonth = (month.date.getMonth() + 1).toString();

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(QueryDateParam.Year, targetYear);
    newSearchParams.set(QueryDateParam.Month, targetMonth);
    setSearchParams(newSearchParams);
  };

  return setMonthQueryParams;
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
