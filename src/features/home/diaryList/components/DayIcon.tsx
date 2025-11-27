import { useEffect, useState } from "react";

type DayIconProps = {
  date: Date;
};

export const DayIcon = (props: DayIconProps) => {
  const { date } = props;
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const [day, setDay] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("ja-JP", { weekday: "short" });
    setDayOfWeek(formatter.format(date));
    setDay(date.getDate().toString());
  }, []);

  return (
    <div className="flex flex-col items-center justify-start gap-1 w-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">{dayOfWeek}</p>
      <div className="w-16 h-16 rounded-full bg-muted-foreground flex items-center justify-center">
        <p className="text-3xl font-bold text-accent-foreground">{day}</p>
      </div>
    </div>
  );
};
