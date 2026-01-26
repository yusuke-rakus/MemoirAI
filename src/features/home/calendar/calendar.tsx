import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
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
        className: "bg-secondary",
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

  return (
    <div className="max-w-6xl mx-auto bg-card rounded-md shadow-sm p-4 h-[800px]">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={date}
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          right: "",
        }}
        locale="ja"
        height="100%"
        dayCellClassNames="transition-colors cursor-pointer hover:bg-muted/30 rounded-md"
        dayCellContent={(arg) => arg.dayNumberText.replace("日", "")}
        eventContent={(arg) => {
          return (
            <div
              className={cn(
                "rounded truncate cursor-pointer transition-opacity w-full text-left",
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
