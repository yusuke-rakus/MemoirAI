// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prepareGuestDiary } from "../useGuestDiary";

const mocks = vi.hoisted(() => ({ metadata: vi.fn(), illustration: vi.fn() }));
vi.mock("@/lib/service/diaryMetadataClient", () => ({
  DiaryMetadataClient: { generate: mocks.metadata },
}));
vi.mock("@/lib/service/diaryIllustrationClient", () => ({
  DiaryIllustrationClient: { generate: mocks.illustration },
}));

const draft = {
  date: "2026-10-03T00:00:00+09:00",
  content: " 公園で散歩した ",
  tags: [{ name: "散歩", color: "default" }],
};
beforeEach(() => {
  mocks.metadata.mockResolvedValue({
    title: "🌳公園の散歩",
    tags: [
      { name: "散歩", color: "lime" },
      { name: "自然", color: "lime" },
    ],
  });
  mocks.illustration.mockResolvedValue(
    new Blob(["image"], { type: "image/png" }),
  );
});

describe("prepareGuestDiary", () => {
  it("通常作成では記憶を使わずタイトルとタグを生成して画像生成を呼ばない", async () => {
    const diary = await prepareGuestDiary(draft, "standard");
    expect(mocks.metadata).toHaveBeenCalledWith(
      "公園で散歩した",
      ["散歩"],
      null,
    );
    expect(mocks.illustration).not.toHaveBeenCalled();
    expect(diary.image).toBeUndefined();
    expect(diary.tags).toEqual([
      { name: "散歩", color: "default" },
      { name: "自然", color: "lime" },
    ]);
    expect(diary.id).toMatch(/^diary-/);
  });

  it("絵日記では本文とタグだけから生成し端末保存用の画像を返す", async () => {
    const diary = await prepareGuestDiary(draft, "illustrated");
    expect(mocks.illustration).toHaveBeenCalledWith({
      content: "公園で散歩した",
      tags: ["散歩"],
      memoryContext: null,
    });
    expect(await diary.image?.text()).toBe("image");
  });

  it("手動画像と空本文と不正な日付はAIを呼ぶ前に拒否する", async () => {
    await expect(
      prepareGuestDiary({ ...draft, images: [{}] }, "illustrated"),
    ).rejects.toThrow("画像を追加");
    await expect(
      prepareGuestDiary({ ...draft, content: " " }, "standard"),
    ).rejects.toThrow("本文");
    await expect(
      prepareGuestDiary({ ...draft, date: "invalid" }, "standard"),
    ).rejects.toThrow();
    expect(mocks.metadata).not.toHaveBeenCalled();
    expect(mocks.illustration).not.toHaveBeenCalled();
  });

  it("画像生成に失敗すると作成結果を返さない", async () => {
    mocks.illustration.mockRejectedValueOnce(new Error("blocked"));
    await expect(prepareGuestDiary(draft, "illustrated")).rejects.toThrow(
      "blocked",
    );
  });
});
