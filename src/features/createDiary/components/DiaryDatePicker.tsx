import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DiaryDatePickerProps = {
  date: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
};

export const DiaryDatePicker = ({
  date,
  onSelect,
  disabled = false,
}: DiaryDatePickerProps) => {
  const dateLabel = format(date, "yyyy年M月d日");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-2 px-2 font-medium text-muted-foreground hover:text-foreground"
          aria-label={`日付を変更（${dateLabel}）`}
          disabled={disabled}
        >
          <CalendarIcon aria-hidden="true" />
          {dateLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit max-w-[calc(100vw-1rem)] p-0"
        align="start"
        sideOffset={8}
        collisionPadding={8}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabled}
          captionLayout="dropdown"
          required
        />
      </PopoverContent>
    </Popover>
  );
};
