import type { TagColor } from "@/constants/tagColors";

export type DiaryCardTag = {
  color: TagColor;
  name: string;
};

export type DiaryCardImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type DiaryCard = {
  id: string;
  title: string;
  body: string;
  tags: DiaryCardTag[];
  images: DiaryCardImage[];
  date: Date;
  isCollapsed: boolean;
  isRemoving: boolean;
};
