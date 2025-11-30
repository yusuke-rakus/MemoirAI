import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type DayIconProps = {
  date: Date;
};

export const DayIcon = ({ date }: DayIconProps) => {
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [isHoliday, setIsHoliday] = useState(false);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("ja-JP", { weekday: "short" });
    const weekdayShort = formatter.format(date);
    setIsHoliday(["土", "日"].includes(weekdayShort));
    setDayOfWeek(weekdayShort);
    setDay(date.getDate().toString());
  }, [date]);

  return (
    <div className="flex flex-col items-center justify-start gap-1 w-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">{dayOfWeek}</p>
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          isHoliday ? "bg-secondary" : "bg-ring"
        )}
      >
        <p className="text-3xl font-bold text-accent-foreground">{day}</p>
      </div>
    </div>
  );
};
