import { cn } from "@/lib/utils";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useRef, useState } from "react";
import { useDiaryList } from "../hooks/useDiaryList";
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

export const Calendar = () => {
  const { dialies } = useDiaryList();
  const [events, setEvents] = useState<Event[]>([]);
  const { date } = useCurrentDateStore();
  const calendarRef = useRef<FullCalendar>(null);

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

  const handleDateClick = (arg: { dateStr: string }) => {
    console.log(`date: ${arg.dateStr}`);
  };

  return (
    <div className="max-w-6xl mx-auto bg-card rounded-md shadow-sm p-4 h-[800px]">
      <style>{`
        .fc {
          --fc-border-color: transparent;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-today-bg-color: transparent;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: none;
        }
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        .fc-col-header-cell-cushion {
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          font-size: 0.875rem;
          padding-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fc-daygrid-day-number {
          color: hsl(var(--foreground));
          font-size: 0.9rem;
          font-weight: 500;
          padding: 8px;
          opacity: 0.8;
        }
        /* Current Month Days */
        .fc-day:not(.fc-day-other) .fc-daygrid-day-number {
          opacity: 1;
        }
        /* Today Highlight */
        .fc-day-today .fc-daygrid-day-number {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 700;
          color: hsl(var(--foreground));
          text-align: left;
          padding-left: 0.5rem;
        }
        .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 2rem;
          padding: 0 0.5rem;
        }
        /* Hide today background cell event if we style the number */
        .fc .fc-daygrid-day.fc-day-today {
          background-color: transparent;
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={date}
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          left: "",
          center: "title",
          right: "",
        }}
        locale="ja"
        height="100%"
        dayCellClassNames="transition-colors cursor-pointer hover:bg-muted/30 rounded-md"
        eventContent={(arg) => {
          return (
            <div
              className={cn(
                "text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity w-full text-left",
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
