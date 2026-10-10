import { isSameDay } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import { Diaries } from "../diaryList/Diaries";
import { useDiaryList } from "../hooks/useDiaryList";
import { Calendar } from "./Calendar";

export const CalendarView = () => {
  const { dialies, loading, error, refetch } = useDiaryList();
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
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedDate, selectedDateDiaries.length]);

  if (error)
    return (
      <div role="alert" className="space-y-3">
        <p>日記を読み込めませんでした。</p>
        <Button variant="outline" onClick={() => void refetch()}>
          再試行
        </Button>
      </div>
    );

  return (
    <div className="mb-0 md:mb-10" aria-busy={loading}>
      {loading && (
        <span role="status" className="sr-only">
          日記を読み込み中です
        </span>
      )}
      <div className="pb-0 md:pb-10">
        <Calendar
          dialies={dialies}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          isLoading={loading}
        />
      </div>
      {!loading && selectedDate && (
        <div ref={diariesRef} className="scroll-mt-28 pt-6 md:pt-0">
          <Diaries dialies={selectedDateDiaries} date={selectedDate} />
        </div>
      )}
    </div>
  );
};
