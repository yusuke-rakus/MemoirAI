import type { LucideIcon } from "lucide-react";
import { CalendarDays, Link2, LogIn, Notebook, PenSquare } from "lucide-react";

type PagePath = {
  path: string;
  name: string;
  icon: LucideIcon;
};

export const PATHS: Record<
  "calendar" | "diaries" | "newDiary" | "login" | "sharedDiary",
  PagePath
> = {
  calendar: {
    path: "/calendar",
    name: "カレンダー",
    icon: CalendarDays,
  },
  diaries: {
    path: "/diaries",
    name: "日記一覧",
    icon: Notebook,
  },
  newDiary: {
    path: "/new-diary",
    name: "新しい日記",
    icon: PenSquare,
  },
  login: {
    path: "/login",
    name: "ログイン",
    icon: LogIn,
  },
  sharedDiary: {
    path: "/shared",
    name: "共有日記",
    icon: Link2,
  },
};

export const PATH_LIST = Object.values(PATHS);
