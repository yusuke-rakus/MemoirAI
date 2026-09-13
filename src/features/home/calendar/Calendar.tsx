import "./calendar.css";

import type { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { isSameDay } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Diary } from "@/types/diary/diary";

import { useCurrentDateStore } from "../provider/CurrentDateProvider";

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

const getMonthWeekCount = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  return Math.ceil((firstDay + daysInMonth) / 7);
};

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

      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const top = containerRef.current.getBoundingClientRect().top;
      const availableHeight = Math.floor(viewportHeight - top - 16);
      // Reserve at most one cell-width for each visible week so that, after
      // the weekday header, cells never exceed square.
      const squareCellHeightLimit = Math.floor(
        (containerRef.current.clientWidth * getMonthWeekCount(date)) / 7,
      );
      const nextHeight = Math.min(availableHeight, squareCellHeightLimit);

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
      window.visualViewport?.removeEventListener(
        "resize",
        updateCalendarHeight,
      );
    };
  }, [date, isMobile]);

  const handleDateClick = (arg: { date: Date }) => {
    onDateSelect?.(arg.date);
  };

  const handleEventClick = (arg: EventClickArg) => {
    if (arg.event.start) {
      onDateSelect?.(arg.event.start);
    }
  };

  const addKeyboardActivation = (
    element: HTMLElement,
    activate: () => void,
  ) => {
    element.tabIndex = 0;
    element.setAttribute("role", "button");
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
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
        eventDidMount={(arg) => {
          const start = arg.event.start;
          arg.el.setAttribute(
            "aria-label",
            `${start?.toLocaleDateString("ja-JP") ?? "日記"} ${arg.event.title}`,
          );
          if (start) addKeyboardActivation(arg.el, () => onDateSelect?.(start));
        }}
        dayCellDidMount={(arg) => {
          arg.el.setAttribute(
            "aria-label",
            arg.date.toLocaleDateString("ja-JP"),
          );
          addKeyboardActivation(arg.el, () => onDateSelect?.(arg.date));
        }}
        dayMaxEventRows={2}
        fixedWeekCount={false}
        moreLinkContent={(arg) => `+${arg.num}件`}
        moreLinkClick="popover"
        showNonCurrentDates
        headerToolbar={false}
        locale="ja"
        height="100%"
        dayCellClassNames={(arg) =>
          cn(
            "cursor-pointer duration-300 hover:bg-muted/50",
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
                "w-full cursor-pointer truncate rounded text-left text-[0.65rem] leading-3 transition-opacity sm:text-sm sm:leading-normal",
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
