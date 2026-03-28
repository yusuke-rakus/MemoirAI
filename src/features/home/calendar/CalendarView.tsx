import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isSameDay } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Diaries } from "../diaryList/Diaries";
import { useDiaryList } from "../hooks/useDiaryList";
import { Calendar } from "./calendar";

export const CalendarView = () => {
  const { dialies } = useDiaryList();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const diariesRef = useRef<HTMLDivElement>(null);
  useDocumentTitle("カレンダー");

  const selectedDateDiaries = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return dialies.filter((diary) =>
      isSameDay(diary.date.toDate(), selectedDate),
    );
  }, [dialies, selectedDate]);

  useEffect(() => {
    if (!selectedDate || !diariesRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      diariesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedDate, selectedDateDiaries.length]);

  return (
    <div className=" mb-10">
      <div className="pb-10">
        <Calendar
          dialies={dialies}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
      {selectedDate && (
        <div ref={diariesRef} className="scroll-mt-20">
          <Diaries dialies={selectedDateDiaries} date={selectedDate} />
        </div>
      )}
    </div>
  );
};
