import { z } from "zod";

import { tagColors } from "@/constants/tagColors";
import type { DiaryCardTag } from "@/types/diaryDraft";

export const diaryTagSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().refine((value) => tagColors.includes(value)),
});

export const metadataSchema = z.object({
  title: z.string().trim().min(1),
  tags: z.array(diaryTagSchema).default([]),
});

export const mergeDiaryTags = (
  selected: DiaryCardTag[],
  generated: DiaryCardTag[],
): DiaryCardTag[] => {
  const tags = new Map<string, DiaryCardTag>();
  for (const tag of [...selected, ...generated]) {
    const name = tag.name.trim();
    const key = name.toLocaleLowerCase("ja-JP");
    if (key && !tags.has(key)) tags.set(key, { ...tag, name });
  }
  return [...tags.values()];
};
