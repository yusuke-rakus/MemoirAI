import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createGeneratedDiaryImageFile,
  DiaryIllustrationClient,
  DiaryIllustrationError,
} from "./diaryIllustrationClient";

const { generateContentMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
}));

vi.mock("@/firebase/models/diaryIllustrationModel", () => ({
  diaryIllustrationModel: {
    generateContent: generateContentMock,
  },
}));

beforeEach(() => {
  generateContentMock.mockReset();
});

describe("DiaryIllustrationClient", () => {
  it("最初のBase64画像をブラウザのFileへ変換する", async () => {
    generateContentMock.mockResolvedValue({
      response: {
        inlineDataParts: () => [
          { inlineData: { mimeType: "image/png", data: "aGVsbG8=" } },
        ],
      },
    });

    const file = await DiaryIllustrationClient.generate({
      content: "公園で桜を見ました。",
      tags: ["散歩", "春"],
    });

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("generated-diary-illustration.png");
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(5);
    expect(generateContentMock).toHaveBeenCalledWith(
      JSON.stringify({
        diaryContent: "公園で桜を見ました。",
        tags: ["散歩", "春"],
      }),
    );
  });

  it("画像がない応答を判別可能なエラーにする", async () => {
    generateContentMock.mockResolvedValue({
      response: { inlineDataParts: () => [] },
    });

    await expect(
      DiaryIllustrationClient.generate({ content: "本文", tags: [] }),
    ).rejects.toMatchObject({ code: "no-image" });
  });

  it("安全フィルタによる拒否を判別可能なエラーにする", async () => {
    generateContentMock.mockResolvedValue({
      response: {
        promptFeedback: { blockReason: "SAFETY" },
        inlineDataParts: () => [],
      },
    });

    await expect(
      DiaryIllustrationClient.generate({ content: "本文", tags: [] }),
    ).rejects.toMatchObject({ code: "safety-blocked" });
  });

  it("画像候補の安全フィルタ拒否をhelper呼び出し前に判定する", async () => {
    const inlineDataParts = vi.fn(() => {
      throw new Error("Firebase helper response error");
    });
    generateContentMock.mockResolvedValue({
      response: {
        candidates: [{ finishReason: "IMAGE_SAFETY" }],
        inlineDataParts,
      },
    });

    await expect(
      DiaryIllustrationClient.generate({ content: "本文", tags: [] }),
    ).rejects.toMatchObject({ code: "safety-blocked" });
    expect(inlineDataParts).not.toHaveBeenCalled();
  });

  it("不正なBase64を拒否する", () => {
    expect(() =>
      createGeneratedDiaryImageFile("image/png", "not-base64"),
    ).toThrowError(DiaryIllustrationError);
    expect(() =>
      createGeneratedDiaryImageFile("image/png", "not-base64"),
    ).toThrow(expect.objectContaining({ code: "invalid-data" }));
  });

  it("非対応MIMEを拒否する", () => {
    expect(() =>
      createGeneratedDiaryImageFile("image/gif", "aGVsbG8="),
    ).toThrow(expect.objectContaining({ code: "unsupported-mime" }));
  });

  it("モデル呼び出し失敗を生成エラーとして返す", async () => {
    generateContentMock.mockRejectedValue(new Error("network"));

    await expect(
      DiaryIllustrationClient.generate({ content: "本文", tags: [] }),
    ).rejects.toMatchObject({ code: "generation-failed" });
  });
});
