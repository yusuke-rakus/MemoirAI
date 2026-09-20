import "./calendar.css";

import type { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { format, isSameDay } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { matchesShortcut, shortcutSurfaceAvailable } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";
import type { Diary } from "@/types/diary/diary";

import { useCurrentDateStore } from "../provider/CurrentDateProvider";
import { useCalendarKeyboard } from "./useCalendarKeyboard";

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
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
  const { date, setDate } = useCurrentDateStore();
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const keyboard = useCalendarKeyboard(
    date,
    setDate,
    containerRef,
    onDateSelect,
  );

  const events = useMemo<Event[]>(
    () =>
      dialies.map((diary) => ({
        id: diary.id,
        title: diary.title,
        date: diary.date.toDate(),
        extendedProps: { text: diary.content },
      })),
    [dialies],
  );

  useEffect(() => {
    let active = true;
    // FullCalendar flushes React updates; run outside the effect lifecycle.
    queueMicrotask(() => {
      if (active) calendarRef.current?.getApi().gotoDate(date);
    });
    return () => {
      active = false;
    };
  }, [date]);

  useEffect(() => {
    const updateCalendarHeight = () => {
      if (!containerRef.current) {
        return;
      }

      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const top = containerRef.current.getBoundingClientRect().top;
      const availableHeight = Math.floor(
        viewportHeight - top - (isMobile ? 0 : 16),
      );
      const nextHeight = isMobile
        ? availableHeight
        : Math.min(
            availableHeight,
            Math.floor(
              (containerRef.current.clientWidth * getMonthWeekCount(date)) / 7,
            ),
          );

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
      if (
        !shortcutSurfaceAvailable() ||
        (!matchesShortcut(event, "daySelect") &&
          !matchesShortcut(event, "daySelectSpace"))
      )
        return;
      event.preventDefault();
      activate();
    });
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={keyboard.onKeyDown}
      onFocus={keyboard.onFocus}
      className="mx-auto h-[calc(100svh-12rem)] max-h-none w-full md:max-h-[800px]"
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
          arg.el.dataset.shortcutDate = format(arg.date, "yyyy-MM-dd");
          arg.el.setAttribute("role", "button");
          arg.el.tabIndex = -1;
          arg.el.setAttribute(
            "aria-label",
            arg.date.toLocaleDateString("ja-JP"),
          );
          keyboard.syncCells();
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
