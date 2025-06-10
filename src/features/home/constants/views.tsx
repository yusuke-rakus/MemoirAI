import { CalendarDays, Notebook } from "lucide-react";
import { CalendarView } from "../calendar/CalendarView";
import { DiaryView } from "../diaryList/DiaryView";

export const Views = [
  {
    value: "calendar",
    name: "カレンダー",
    icon: <CalendarDays />,
    component: <CalendarView />,
  },
  {
    value: "diaries",
    name: "日記一覧",
    icon: <Notebook />,
    component: <DiaryView />,
  },
];
