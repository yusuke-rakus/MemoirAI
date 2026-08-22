import type { Diary, Tag } from "@/types/diary/diary";
import { endOfDay, startOfDay, subYears } from "date-fns";

export type DiarySearchResult = {
  diary: Diary;
  score: number;
};

export type FrequentTag = Tag & {
  count: number;
  lastUsedAt: number;
};

export const normalizeSearchText = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();

export const searchDiaries = (
  diaries: Diary[],
  query: string,
): DiarySearchResult[] => {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  return diaries
    .map((diary) => {
      const title = normalizeSearchText(diary.title);
      const tags = normalizeSearchText(
        diary.tags.map((tag) => tag.name).join(" "),
      );
      const content = normalizeSearchText(diary.content);
      const matches = terms.every(
        (term) =>
          title.includes(term) || tags.includes(term) || content.includes(term),
      );
      if (!matches) return null;

      const score = terms.reduce(
        (total, term) =>
          total +
          (title.includes(term) ? 3 : 0) +
          (tags.includes(term) ? 2 : 0) +
          (content.includes(term) ? 1 : 0),
        0,
      );

      return { diary, score };
    })
    .filter((result): result is DiarySearchResult => result !== null)
    .sort(
      (a, b) =>
        b.score - a.score || b.diary.date.toMillis() - a.diary.date.toMillis(),
    );
};

export const getFrequentTags = (
  diaries: Diary[],
  now = new Date(),
  limit = 10,
): FrequentTag[] => {
  const rangeStart = startOfDay(subYears(now, 1)).getTime();
  const rangeEnd = endOfDay(now).getTime();
  const aggregates = new Map<string, FrequentTag>();

  diaries.forEach((diary) => {
    const diaryDate = diary.date.toMillis();
    if (diaryDate < rangeStart || diaryDate > rangeEnd) return;

    const seenInDiary = new Set<string>();
    diary.tags.forEach((tag) => {
      const normalizedName = normalizeSearchText(tag.name);
      if (!normalizedName || seenInDiary.has(normalizedName)) return;
      seenInDiary.add(normalizedName);

      const displayName = tag.name.trim().replace(/\s+/g, " ");
      const current = aggregates.get(normalizedName);
      if (!current) {
        aggregates.set(normalizedName, {
          ...tag,
          name: displayName,
          count: 1,
          lastUsedAt: diaryDate,
        });
        return;
      }

      current.count += 1;
      if (diaryDate > current.lastUsedAt) {
        aggregates.set(normalizedName, {
          ...tag,
          name: displayName,
          count: current.count,
          lastUsedAt: diaryDate,
        });
      }
    });
  });

  return Array.from(aggregates.values())
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.lastUsedAt - a.lastUsedAt ||
        a.name.localeCompare(b.name, "ja"),
    )
    .slice(0, Math.max(0, limit));
};

const includesSearchTerm = (query: string, term: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedQuery || !normalizedTerm) return false;

  return ` ${normalizedQuery} `.includes(` ${normalizedTerm} `);
};

export const appendSearchTerm = (query: string, term: string) => {
  const trimmedQuery = query.trim();
  const trimmedTerm = term.trim().replace(/\s+/g, " ");
  if (!trimmedTerm || includesSearchTerm(trimmedQuery, trimmedTerm)) {
    return trimmedQuery;
  }

  return trimmedQuery ? `${trimmedQuery} ${trimmedTerm}` : trimmedTerm;
};
