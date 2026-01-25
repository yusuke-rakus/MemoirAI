import { cn } from "@/lib/utils";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useState } from "react";
import { useDiaryList } from "../hooks/useDiaryList";

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
  const [currentDate] = useState(new Date());
  const { dialies } = useDiaryList();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(
      dialies.map((diary) => ({
        id: diary.id,
        title: diary.title,
        date: diary.date.toDate(),
        className: "bg-secondary",
        extendedProps: { text: diary.content },
      }))
    );
  }, [dialies]);

  const handleDateClick = (arg: { dateStr: string }) => {
    console.log(`date: ${arg.dateStr}`);
  };

  return (
    <div className="max-w-6xl mx-auto bg-card rounded-md shadow-sm p-4 h-[800px]">
      <style>{`
        .fc {
          --fc-border-color: hsl(var(--border));
          --fc-page-bg-color: hsl(var(--background));
          --fc-neutral-bg-color: hsl(var(--muted));
          --fc-list-event-hover-bg-color: hsl(var(--accent));
          --fc-today-bg-color: hsl(var(--accent) / 0.5);
          --fc-now-indicator-color: hsl(var(--primary));
          --fc-event-bg-color: hsl(var(--primary));
          --fc-event-border-color: hsl(var(--primary));
          --fc-event-text-color: hsl(var(--primary-foreground));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-text-color: hsl(var(--primary-foreground));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        .fc-col-header-cell-cushion {
          color: hsl(var(--muted-foreground));
          font-weight: normal;
          padding-bottom: 8px;
        }
        .fc-daygrid-day-number {
          color: hsl(var(--foreground));
          font-size: 0.875rem;
          padding: 8px;
        }
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .fc-button {
          border-radius: var(--radius) !important;
          font-weight: 500;
          padding: 0 1rem !important;
          height: 2.25rem !important;
          font-size: 0.875rem !important;
          line-height: 2rem !important;
        }
        .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 1.5rem;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={currentDate}
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        locale="ja"
        buttonText={{
          today: "今日",
          month: "月",
          week: "週",
          day: "日",
          list: "リスト",
        }}
        height="100%"
        dayCellClassNames="hover:bg-accent/50 transition-colors cursor-pointer"
        eventContent={(arg) => {
          return (
            <div
              className={cn(
                "text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity w-full text-left",
                arg.event.classNames.join(" ")
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
