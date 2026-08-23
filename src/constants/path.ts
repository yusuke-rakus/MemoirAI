import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CalendarDays,
  FileText,
  Link2,
  LogIn,
  Notebook,
  PenSquare,
  ShieldCheck,
} from "lucide-react";

type PagePath = {
  path: string;
  name: string;
  icon: LucideIcon;
};

export const PATHS: Record<
  | "calendar"
  | "diaries"
  | "newDiary"
  | "login"
  | "sharedDiary"
  | "legal"
  | "terms"
  | "privacy"
  | "aiDataUse",
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
  legal: {
    path: "/legal",
    name: "利用規約",
    icon: FileText,
  },
  terms: {
    path: "/terms",
    name: "利用規約",
    icon: FileText,
  },
  privacy: {
    path: "/privacy",
    name: "プライバシーポリシー",
    icon: ShieldCheck,
  },
  aiDataUse: {
    path: "/ai-data-use",
    name: "AIデータ利用方針",
    icon: Bot,
  },
};

export const PATH_LIST = Object.values(PATHS);
