import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isSameDay } from "date-fns";
import { useMemo, useState } from "react";
import { Diaries } from "../diaryList/Diaries";
import { useDiaryList } from "../hooks/useDiaryList";
import { Calendar } from "./calendar";

export const CalendarView = () => {
  const { dialies } = useDiaryList();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  useDocumentTitle("カレンダー");

  const selectedDateDiaries = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return dialies.filter((diary) => isSameDay(diary.date.toDate(), selectedDate));
  }, [dialies, selectedDate]);

  return (
    <>
      <div className="pb-10">
        <Calendar
          dialies={dialies}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
      {selectedDate && <Diaries dialies={selectedDateDiaries} />}
    </>
  );
};
