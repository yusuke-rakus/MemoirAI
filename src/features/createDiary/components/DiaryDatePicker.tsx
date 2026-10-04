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
}: DiaryDatePickerProps) => (
  <div className="text-muted-foreground">
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-3 px-3 text-base font-medium tracking-tight text-muted-foreground hover:text-foreground sm:text-lg"
          aria-label="日付を変更"
          disabled={disabled}
        >
          <CalendarIcon className="h-5 w-5" />
          {format(date, "yyyy年M月d日")}
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
  </div>
);
