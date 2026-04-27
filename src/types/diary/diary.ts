import type { Timestamp } from "firebase/firestore";

export type Tag = {
  name: string;
  color: string;
};

export type DiaryImage = {
  id: string;
  storagePath: string;
  downloadURL: string;
  width: number;
  height: number;
  contentType: string;
};

export type Diary = {
  id: string;
  uid: string;
  date: Timestamp;
  title: string;
  content: string;
  tags: Tag[];
  images?: DiaryImage[];
  createdAt: Timestamp;
};
