import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Event {
  id: string;
  date: string;
  text: string;
  color?: string;
}

type CalendarProps = {
  id: string;
  date: string;
  text: string;
  color: string;
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    { id: "1", date: "2025-06-15", text: "🤝会議", color: "bg-blue-500" },
    { id: "2", date: "2025-06-20", text: "プレゼン", color: "bg-green-500" },
    { id: "3", date: "2025-06-25", text: "歯医者", color: "bg-red-500" },
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState("");

  const months = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // 前月の日付を追加
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // 次月の日付を追加（35日になるまで）
    const remainingDays = 35 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = formatDate(date);
    return events.filter((event) => event.date === dateStr);
  };

  const goToPreviousMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date: Date): void => {
    console.log(`date: ${date}`);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 divide-x">
        {weekdays.map((day, index) => (
          <div key={day} className="text-center text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 divide-x divide-y">
        {days.map((date, index) => {
          const dateEvents = getEventsForDate(date);
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                h-32 p-2 cursor-pointer transition-all duration-200
                ${
                  isCurrentMonth(date)
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-50 text-gray-400"
                }
                ${isToday(date) ? "bg-blue-500" : ""}
                ${isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""}
              `}
            >
              <div className="text-sm mb-1 text-gray-700 text-center">
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {dateEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      //   e.stopPropagation();
                      //   deleteEvent(event.id);
                    }}
                    className={`
                      text-xs text-white px-2 py-1 rounded truncate cursor-pointer
                      hover:opacity-80 transition-opacity
                      ${event.color || "bg-blue-500"}
                    `}
                    title={`${event.text} (クリックで削除)`}
                  >
                    {event.text}
                  </div>
                ))}
                {dateEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dateEvents.length - 2}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
