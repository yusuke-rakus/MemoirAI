import { beforeEach, describe, expect, it, vi } from "vitest";

import { DiaryMetadataClient } from "../diaryMetadataClient";

const generate = vi.hoisted(() => vi.fn());
vi.mock("@/firebase/models/createDiarySchema", () => ({
  diaryTitleModel: { generateContent: generate },
}));

beforeEach(() => generate.mockReset());

describe("DiaryMetadataClient.generate", () => {
  it("AI出力でタグが省略されている場合は空配列として扱う", async () => {
    generate.mockResolvedValue({
      response: { text: () => JSON.stringify({ title: "🌳散歩" }) },
    });
    await expect(
      DiaryMetadataClient.generate("本文", [], null),
    ).resolves.toEqual({ title: "🌳散歩", tags: [] });
  });

  it.each([
    { title: "" },
    { title: "散歩", tags: [{ name: "散歩", color: "invalid" }] },
    { title: "散歩", tags: [{ name: "", color: "default" }] },
    { title: 42 },
  ])("不正なタイトルやタグを永続化前に拒否する: %j", async (metadata) => {
    generate.mockResolvedValue({
      response: { text: () => JSON.stringify(metadata) },
    });
    await expect(
      DiaryMetadataClient.generate("本文", [], null),
    ).rejects.toThrow();
  });
});
