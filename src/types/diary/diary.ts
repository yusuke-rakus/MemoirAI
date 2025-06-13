import type { Timestamp } from "firebase/firestore";

export type Tag = {
  name: string;
  color: string;
};

export type Diary = {
  id: string;
  uid: string;
  date: Timestamp;
  title: string;
  content: string;
  tags: Tag[];
  createdAt: Timestamp;
};
