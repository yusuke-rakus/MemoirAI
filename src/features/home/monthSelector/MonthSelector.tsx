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
    console.log(scrollRef.current);
    scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };
  const scrollRight = () => {
    console.log(scrollRef.current);
    scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  setScrollToCurrentMonth(currentMonthRef, months);

  return (
    <div className="flex items-center">
      <MonthSelectorScrollButton onToggle={scrollLeft} scroll={"left"} />
      <div className="max-w-lg overflow-x-auto snap-x">
        <div ref={scrollRef} className="flex w-full space-x-4 p-4">
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
      <MonthSelectorScrollButton onToggle={scrollRight} scroll={"right"} />
    </div>
  );
};
