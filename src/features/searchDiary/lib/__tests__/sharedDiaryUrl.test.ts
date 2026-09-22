import { describe, expect, it } from "vitest";

import { parseSharedDiaryUrl } from "../sharedDiaryUrl";

const origin = "https://memoir.test";

describe("parseSharedDiaryUrl", () => {
  it.each(["share-123", "diary-123"])(
    "新旧の共有ID %s を内部パスへ変換する",
    (id) => {
      expect(parseSharedDiaryUrl(`${origin}/shared/${id}`, origin)).toEqual({
        kind: "shared",
        path: `/shared/${id}`,
      });
    },
  );

  it("前後の空白と末尾スラッシュを許容しクエリとフラグメントを除く", () => {
    expect(
      parseSharedDiaryUrl(
        `  ${origin}/shared/share-123/?from=message#top\n`,
        origin,
      ),
    ).toEqual({
      kind: "shared",
      path: "/shared/share-123",
    });
  });

  it("HTTPの開発環境でも同じオリジンなら開ける", () => {
    expect(
      parseSharedDiaryUrl(
        "http://localhost:5173/shared/diary-1",
        "http://localhost:5173",
      ),
    ).toEqual({
      kind: "shared",
      path: "/shared/diary-1",
    });
  });

  it.each([
    "",
    "旅行",
    "旅行の思い出とタグ",
    "日記でhttps://example.comに言及",
  ])("通常の入力 %s は検索語として扱う", (input) => {
    expect(parseSharedDiaryUrl(input, origin)).toEqual({ kind: "keyword" });
  });

  it.each([
    "https://other.test/shared/share-1",
    "http://memoir.test/shared/share-1",
    "https://memoir.test:444/shared/share-1",
    "https://memoir.test/shared",
    "https://memoir.test/shared/",
    "https://memoir.test/shared/share-1/extra",
    "https://memoir.test/diaries/diary-1",
    "https://memoir.test/other/../shared/share-1",
    "https://memoir.test/shared/%2F",
    "https://memoir.test/shared/%5C",
    "https://memoir.test/shared/%00",
    "https://memoir.test/shared/%20",
    "https://memoir.test/shared/%ZZ",
    "https://memoir.test/shared/..",
    "https://memoir.test/shared/%2e%2e",
    "https://memoir.test/shared/share-\n1",
    "https://memoir.test/shared/share-1\\extra",
    "https://user:password@memoir.test/shared/share-1",
    "https://",
    "https:/memoir.test/shared/share-1",
    "javascript:alert(1)",
    "ftp://memoir.test/shared/share-1",
    "//memoir.test/shared/share-1",
    "/shared/share-1",
    "www.memoir.test/shared/share-1",
  ])("不正または対象外のURL %s を拒否する", (input) => {
    expect(parseSharedDiaryUrl(input, origin)).toEqual({ kind: "invalid" });
  });
});
