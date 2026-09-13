import { format } from "date-fns";

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

export const diaryQueryKeys = {
  all: (uid: string) => ["diaries", uid] as const,
  byDate: (uid: string, date: Date) =>
    [...diaryQueryKeys.all(uid), "date", dateKey(date)] as const,
  byMonth: (uid: string, year: number, month: number) =>
    [...diaryQueryKeys.all(uid), "month", year, month] as const,
  search: (uid: string) => [...diaryQueryKeys.all(uid), "search"] as const,
  sidebar: (uid: string) => [...diaryQueryKeys.all(uid), "sidebar"] as const,
};

export const sharedDiaryQueryKeys = {
  byShareId: (shareId: string) => ["sharedDiary", shareId] as const,
  status: (uid: string, diaryId: string, shareId: string) =>
    ["sharedDiary", "status", uid, diaryId, shareId] as const,
  byOwner: (uid: string) => ["sharedDiaries", "owner", uid] as const,
};

export const favoriteQueryKeys = {
  all: (uid: string) => ["favorites", uid] as const,
  list: (uid: string) => [...favoriteQueryKeys.all(uid), "list"] as const,
  byShareId: (uid: string, shareId: string) =>
    [...favoriteQueryKeys.all(uid), "status", shareId] as const,
};
