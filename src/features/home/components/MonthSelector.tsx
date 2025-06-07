import { MonthSelectorScrollButton } from "@/components/shared/calendar/MonthSelectorScrollButton";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";

export const MonthSelector = () => {
  const [months, setMonths] = useState<
    { label: string; date: Date; isButton: boolean }[]
  >([]);
  const currentMonthRef = useRef<HTMLButtonElement | null>(null);

  const generateNext12Months = (now: Date) => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.getMonth() + 1 + "月";
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    console.log(scrollRef.current);
    scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };

  const scrollRight = () => {
    console.log(scrollRef.current);
    scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  useEffect(() => {
    currentMonthRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [months]);

  return (
    <div className="flex items-center">
      <MonthSelectorScrollButton onToggle={scrollLeft} scroll={"left"} />
      <ScrollArea className="max-w-lg overflow-x-auto">
        <div ref={scrollRef} className="flex w-full space-x-4 p-4">
          {months.map((month) => {
            const isCurrentMonth =
              month.date.getMonth() === new Date().getMonth() &&
              month.date.getFullYear() === new Date().getFullYear();
            return (
              <div
                key={month.isButton ? month.date.toISOString() : month.label}
                className="flex justify-center items-center"
              >
                {month.isButton ? (
                  <Button ref={isCurrentMonth ? currentMonthRef : null}>
                    {month.label}
                  </Button>
                ) : (
                  <span>{month.label}</span>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <MonthSelectorScrollButton onToggle={scrollRight} scroll={"right"} />
    </div>
  );
};
