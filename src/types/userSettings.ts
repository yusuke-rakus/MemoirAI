import type { Timestamp } from "firebase/firestore";

export type UserProfileSettings = {
  uid: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
