import { MonthSelectorScrollButton } from "@/components/shared/calendar/MonthSelectorScrollButton";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  useMonths,
  useScrollToCurrentMonth,
  useSetMonthRouteParams,
} from "./hooks/useMonthSelector";

type MonthSelectorProps = {
  targetDate: Date;
};

export const MonthSelector = (props: MonthSelectorProps) => {
  const { targetDate } = props;
  const months = useMonths();
  const setMonthRouteParams = useSetMonthRouteParams();
  const { currentMonthRef, setScrollToCurrentMonth } =
    useScrollToCurrentMonth();

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  setScrollToCurrentMonth(currentMonthRef, months);

  return (
    <div className="flex items-center w-full max-w-lg mx-auto overflow-hidden">
      <div className="flex-shrink-0">
        <MonthSelectorScrollButton onToggle={scrollLeft} scroll={"left"} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          ref={scrollRef}
          className="flex w-full space-x-4 p-4 overflow-x-auto snap-x"
        >
          {months.map((month) => {
            const isTargetMonth =
              month.date.getMonth() === targetDate.getMonth() &&
              month.date.getFullYear() === targetDate.getFullYear();

            return (
              <div
                key={month.isButton ? month.date.toISOString() : month.label}
                className="flex justify-center items-center snap-end snap-always"
              >
                {month.isButton ? (
                  <Button
                    onClick={() => setMonthRouteParams(month)}
                    ref={isTargetMonth ? currentMonthRef : null}
                    variant={isTargetMonth ? "default" : "secondary"}
                  >
                    {month.label}
                  </Button>
                ) : (
                  <span>{month.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-shrink-0">
        <MonthSelectorScrollButton onToggle={scrollRight} scroll={"right"} />
      </div>
    </div>
  );
};
