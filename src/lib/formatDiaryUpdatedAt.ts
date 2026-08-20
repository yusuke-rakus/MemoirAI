import type { Diary } from "@/types/diary/diary";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
  format,
  isAfter,
  subMonths,
} from "date-fns";

type DiaryTimestamps = Pick<Diary, "createdAt" | "updatedAt">;

export const getDiaryUpdatedAt = ({ createdAt, updatedAt }: DiaryTimestamps) =>
  (updatedAt ?? createdAt).toDate();

export const formatDiaryUpdatedAt = (
  diary: DiaryTimestamps,
  now = new Date(),
) => {
  const updatedAt = getDiaryUpdatedAt(diary);

  if (!isAfter(now, updatedAt)) {
    return "たった今";
  }

  if (!isAfter(updatedAt, subMonths(now, 3))) {
    return format(updatedAt, "yyyy年M月d日");
  }

  const minutes = differenceInMinutes(now, updatedAt);
  if (minutes < 1) {
    return "たった今";
  }
  if (minutes < 60) {
    return `${minutes}分前`;
  }

  const hours = differenceInHours(now, updatedAt);
  if (hours < 24) {
    return `${hours}時間前`;
  }

  const days = differenceInDays(now, updatedAt);
  if (days < 7) {
    return `${days}日前`;
  }

  const weeks = differenceInWeeks(now, updatedAt);
  if (weeks < 4) {
    return `${weeks}週間前`;
  }

  return `${Math.max(1, differenceInMonths(now, updatedAt))}か月前`;
};
