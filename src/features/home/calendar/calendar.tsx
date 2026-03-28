import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Diary } from "@/types/diary/diary";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { isSameDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
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

interface CalendarProps {
  dialies: Diary[];
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
}

export const Calendar = ({
  dialies,
  selectedDate,
  onDateSelect,
}: CalendarProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
  const { date } = useCurrentDateStore();
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  useEffect(() => {
    const updateCalendarHeight = () => {
      if (!containerRef.current) {
        return;
      }

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const top = containerRef.current.getBoundingClientRect().top;
      const nextHeight = Math.floor(viewportHeight - top - 16);

      if (nextHeight <= 0) {
        return;
      }

      setCalendarHeight(isMobile ? nextHeight : Math.min(nextHeight, 800));
    };

    const frameId = window.requestAnimationFrame(updateCalendarHeight);

    window.addEventListener("resize", updateCalendarHeight);
    window.visualViewport?.addEventListener("resize", updateCalendarHeight);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateCalendarHeight);
      window.visualViewport?.removeEventListener("resize", updateCalendarHeight);
    };
  }, [isMobile]);

  const handleDateClick = (arg: { date: Date }) => {
    onDateSelect?.(arg.date);
  };

  const handleEventClick = (arg: EventClickArg) => {
    if (arg.event.start) {
      onDateSelect?.(arg.event.start);
    }
  };

  return (
    <div
      ref={containerRef}
      className="mx-auto h-[calc(100svh-12rem)] max-h-[800px] w-full"
      style={calendarHeight ? { height: `${calendarHeight}px` } : undefined}
    >
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
        dayCellClassNames={(arg) =>
          cn(
            "cursor-pointer hover:bg-muted/50 duration-300",
            selectedDate &&
              isSameDay(arg.date, selectedDate) &&
              "bg-primary/10",
          )
        }
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
