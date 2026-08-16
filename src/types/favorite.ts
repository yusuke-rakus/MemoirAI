import type { Timestamp } from "firebase/firestore";

export type Favorite = {
  sharedDiaryId: string;
  createdAt: Timestamp;
};
