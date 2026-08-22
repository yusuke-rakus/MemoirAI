import type { Diary, Tag } from "@/types/diary/diary";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";
import {
  appendSearchTerm,
  getFrequentTags,
  searchDiaries,
} from "./diarySearch";

type DiaryOptions = {
  id?: string;
  date: Date;
  title?: string;
  content?: string;
  tags?: Tag[];
};

const createDiary = ({
  id = "diary-1",
  date,
  title = "日記",
  content = "本文",
  tags = [],
}: DiaryOptions): Diary => ({
  id,
  uid: "user-1",
  date: Timestamp.fromDate(date),
  title,
  content,
  tags,
  createdAt: Timestamp.fromDate(date),
});

describe("searchDiaries", () => {
  it("表記を正規化し、すべての検索語に一致する日記を関連度順で返す", () => {
    const newerTagMatch = createDiary({
      id: "tag-match",
      date: new Date(2026, 7, 21),
      title: "週末",
      content: "海へ行きました",
      tags: [{ name: "家族", color: "sky" }],
    });
    const olderTitleMatch = createDiary({
      id: "title-match",
      date: new Date(2026, 7, 20),
      title: "家族と海へ",
      content: "楽しい一日でした",
    });
    const partialMatch = createDiary({
      id: "partial-match",
      date: new Date(2026, 7, 22),
      title: "家族の休日",
      content: "山へ行きました",
    });

    const results = searchDiaries(
      [newerTagMatch, olderTitleMatch, partialMatch],
      " 家族　海 ",
    );

    expect(results.map(({ diary }) => diary.id)).toEqual([
      "title-match",
      "tag-match",
    ]);
  });
});

describe("getFrequentTags", () => {
  const now = new Date(2026, 7, 22, 12);

  it("直近1年だけを対象に表記揺れを統合し、同じ日記内では一度だけ数える", () => {
    const diaries = [
      createDiary({
        id: "boundary",
        date: new Date(2025, 7, 22, 0),
        tags: [
          { name: " ＴＲＩＰ ", color: "amber" },
          { name: "trip", color: "lime" },
          { name: "  ", color: "default" },
        ],
      }),
      createDiary({
        id: "newer",
        date: new Date(2026, 7, 20),
        tags: [{ name: "Trip", color: "pink" }],
      }),
      createDiary({
        id: "too-old",
        date: new Date(2025, 7, 21, 23, 59, 59, 999),
        tags: [{ name: "古いタグ", color: "default" }],
      }),
      createDiary({
        id: "future",
        date: new Date(2026, 7, 23),
        tags: [{ name: "未来", color: "default" }],
      }),
    ];

    expect(getFrequentTags(diaries, now)).toEqual([
      expect.objectContaining({
        name: "Trip",
        color: "pink",
        count: 2,
        lastUsedAt: new Date(2026, 7, 20).getTime(),
      }),
    ]);
  });

  it("頻度、最終使用日、タグ名の順に並べ、指定件数まで返す", () => {
    const mostFrequent = createDiary({
      id: "frequent-1",
      date: new Date(2026, 7, 18),
      tags: [{ name: "散歩", color: "lime" }],
    });
    const tags = ["かきく", "あいう", "さしす", "たちつ", "なにぬ"];
    const latest = createDiary({
      id: "latest",
      date: new Date(2026, 7, 21),
      tags: [
        { name: "写真", color: "sky" },
        ...tags.map((name) => ({ name, color: "default" })),
      ],
    });
    const older = createDiary({
      id: "older",
      date: new Date(2026, 7, 19),
      tags: [
        { name: "散歩", color: "lime" },
        { name: "読書", color: "violet" },
      ],
    });

    const results = getFrequentTags([mostFrequent, latest, older], now, 4);

    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(
      expect.objectContaining({ name: "散歩", count: 2 }),
    );
    expect(results[1]?.name).toBe("あいう");
    expect(results[2]?.name).toBe("かきく");
    expect(results[3]?.name).toBe("さしす");
  });
});

describe("appendSearchTerm", () => {
  it.each([
    ["", "散歩", "散歩"],
    ["家族", "散歩", "家族 散歩"],
    ["  家族  ", "  朝　散歩  ", "家族 朝 散歩"],
    ["家族 朝 散歩", "朝 散歩", "家族 朝 散歩"],
    ["trip", "ＴＲＩＰ", "trip"],
    ["家族", "  ", "家族"],
  ])("%j に %j を重複なく追加する", (query, term, expected) => {
    expect(appendSearchTerm(query, term)).toBe(expected);
  });
});
