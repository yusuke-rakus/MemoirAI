import type { Timestamp } from "firebase/firestore";
import type { Diary } from "./diary";

export type SharedDiary = Diary & {
  sharedAt: Timestamp;
};
