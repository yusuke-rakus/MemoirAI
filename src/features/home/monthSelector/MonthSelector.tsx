import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useSetMonthRouteParams } from "./hooks/useMonthSelector";

const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export const MonthSelector = ({ targetDate }: { targetDate: Date }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(targetDate.getFullYear());
  const setMonth = useSetMonthRouteParams();

  useEffect(() => {
    setPickerYear(targetDate.getFullYear());
  }, [targetDate]);

  const select = (date: Date) => {
    setMonth({ date, label: "", isButton: true });
  };

  const handleSelectMonth = (monthIndex: number) => {
    select(new Date(pickerYear, monthIndex, 1));
    setIsOpen(false);
  };

  const now = new Date();

  return (
    <nav
      aria-label="表示する年月"
      className="flex w-full items-center gap-2 px-2 py-3 sm:gap-3"
    >
      <Button
        variant="outline"
        size="sm"
        className="rounded-full px-4 font-normal text-foreground"
        onClick={() => select(now)}
      >
        今月
      </Button>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="前の月"
          className="size-9 rounded-full"
          disabled={format(targetDate, "yyyy-MM") === "1000-01"}
          onClick={() => select(addMonths(targetDate, -1))}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="次の月"
          className="size-9 rounded-full"
          disabled={format(targetDate, "yyyy-MM") === "9999-12"}
          onClick={() => select(addMonths(targetDate, 1))}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setPickerYear(targetDate.getFullYear());
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-1.5 text-xl font-medium tracking-tight text-foreground hover:bg-accent md:text-2xl"
            aria-label="表示する年月を選択"
          >
            {format(targetDate, "yyyy年 M月")}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-3"
          align="start"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md"
                aria-label="前年"
                disabled={pickerYear <= 1000}
                onClick={() => setPickerYear((y) => Math.max(1000, y - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-base font-semibold">{pickerYear}年</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md"
                aria-label="翌年"
                disabled={pickerYear >= 9999}
                onClick={() => setPickerYear((y) => Math.min(9999, y + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, index) => {
                const isSelected =
                  targetDate.getFullYear() === pickerYear &&
                  targetDate.getMonth() === index;
                const isCurrentMonth =
                  now.getFullYear() === pickerYear &&
                  now.getMonth() === index;

                return (
                  <Button
                    key={label}
                    type="button"
                    variant={
                      isSelected
                        ? "default"
                        : isCurrentMonth
                          ? "secondary"
                          : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "h-10 text-sm font-medium",
                      isSelected && "font-semibold shadow-xs",
                      !isSelected && isCurrentMonth && "border border-border",
                    )}
                    aria-label={`${pickerYear}年${label}を選択`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectMonth(index)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <span className="sr-only" role="status">
        {format(targetDate, "yyyy年M月")}を表示中
      </span>
    </nav>
  );
};
