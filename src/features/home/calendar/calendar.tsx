import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDiaryList } from "../hooks/useDiaryList";
import { useCurrentDateStore } from "../provider/CurrentDateProvider";

import "./calendar.css";

interface Event {
  id: string;
  title: string;
  start?: string;
  end?: string;
  date?: Date;
  className?: string;
  extendedProps?: {
    text: string;
  };
}

export const Calendar = () => {
  const { dialies } = useDiaryList();
  const [events, setEvents] = useState<Event[]>([]);
  const { date } = useCurrentDateStore();
  const calendarRef = useRef<FullCalendar>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEvents(
      dialies.map((diary) => ({
        id: diary.id,
        title: diary.title,
        date: diary.date.toDate(),
        // className: "bg-transparent",
        extendedProps: { text: diary.content },
      })),
    );
  }, [dialies]);

  useEffect(() => {
    if (calendarRef.current && date) {
      calendarRef.current.getApi().gotoDate(date);
    }
  }, [date]);

  const handleDateClick = (arg: { date: Date }) => {
    const dateStr = format(arg.date, "yyyy-MM-dd");
    navigate(`${PATHS.newDiary.path}/${dateStr}`);
  };

  const handleEventClick = (arg: EventClickArg) => {
    console.log("clicked event:", arg.event);
  };

  return (
    <div className="mx-auto h-[calc(100dvh-14rem)] min-h-[480px] w-full sm:h-[800px]">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={date}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        dayMaxEvents={3}
        moreLinkContent={(arg) => `+${arg.num}件`}
        moreLinkClick="popover"
        headerToolbar={false}
        locale="ja"
        height="100%"
        dayCellClassNames="cursor-pointer hover:bg-muted/50 duration-300"
        dayCellContent={(arg) => arg.dayNumberText.replace("日", "")}
        eventContent={(arg) => {
          return (
            <div
              className={cn(
                "w-full cursor-pointer rounded text-left text-xs truncate transition-opacity sm:text-sm",
                arg.event.classNames.join(" "),
              )}
              title={arg.event.title}
            >
              {arg.event.title}
            </div>
          );
        }}
      />
    </div>
  );
};
