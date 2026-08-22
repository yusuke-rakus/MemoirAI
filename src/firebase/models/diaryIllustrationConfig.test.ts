import { describe, expect, it } from "vitest";
import { resolveDiaryIllustrationConfig } from "./diaryIllustrationConfig";

describe("resolveDiaryIllustrationConfig", () => {
  it("未設定時はFlash-Liteの1Kを使用する", () => {
    expect(resolveDiaryIllustrationConfig()).toEqual({
      model: "gemini-3.1-flash-lite-image",
      imageSize: "1K",
    });
  });

  it.each([
    ["gemini-3.1-flash-lite-image", "512"],
    ["gemini-3.1-flash-lite-image", "1K"],
    ["gemini-3.1-flash-image", "4K"],
    ["gemini-3-pro-image", "1K"],
    ["gemini-3-pro-image", "4K"],
  ])("対応するモデルとサイズを受け入れる: %s / %s", (model, imageSize) => {
    expect(resolveDiaryIllustrationConfig(model, imageSize)).toEqual({
      model,
      imageSize,
    });
  });

  it("不明なモデルを拒否する", () => {
    expect(() => resolveDiaryIllustrationConfig("unknown", "1K")).toThrow(
      "Unsupported diary image model: unknown",
    );
  });

  it("不明なサイズを拒否する", () => {
    expect(() =>
      resolveDiaryIllustrationConfig("gemini-3.1-flash-image", "8K"),
    ).toThrow("Unsupported diary image size: 8K");
  });

  it("モデルが対応しないサイズを拒否する", () => {
    expect(() =>
      resolveDiaryIllustrationConfig("gemini-3-pro-image", "512"),
    ).toThrow("Diary image size 512 is not supported by gemini-3-pro-image");
  });
});
