import { PATHS } from "@/constants/path";
import { CalendarView } from "../calendar/CalendarView";
import { DiaryView } from "../diaryList/DiaryView";

const CalendarIcon = PATHS.calendar.icon;
const DiaryIcon = PATHS.diaries.icon;

export const Views = [
  {
    value: PATHS.calendar.path,
    name: PATHS.calendar.name,
    icon: <CalendarIcon />,
    component: <CalendarView />,
  },
  {
    value: PATHS.diaries.path,
    name: PATHS.diaries.name,
    icon: <DiaryIcon />,
    component: <DiaryView />,
  },
];
