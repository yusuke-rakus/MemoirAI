import { beforeEach, describe, expect, it, vi } from "vitest";

const HISTORY_KEY = "memoir-ai:diary-writing-prompts:v1";

describe("日記の書き出し候補", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.removeItem(HISTORY_KEY);
  });

  it("120種類を一巡するまで重複せず、次の一巡の先頭も直前と異なる", async () => {
    const { drawDiaryWritingPrompt } = await import("../useDiaryWritingPrompt");
    const random = vi.spyOn(Math, "random").mockReturnValue(0.999999);
    const cycle = Array.from({ length: 120 }, drawDiaryWritingPrompt);

    expect(new Set(cycle).size).toBe(120);
    expect(
      cycle.filter((prompt) => /(?:だよ|かも) \S+$/.test(prompt)),
    ).toHaveLength(60);

    random.mockReturnValue(0);
    const nextCycle = Array.from({ length: 120 }, drawDiaryWritingPrompt);
    expect(nextCycle[0]).not.toBe(cycle[119]);
    expect(new Set(nextCycle)).toEqual(new Set(cycle));
  });

  it("画面の再読み込みに相当する状態でも保存済みの候補を避ける", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const initial = await import("../useDiaryWritingPrompt");
    const first = initial.drawDiaryWritingPrompt();

    vi.resetModules();
    const reloaded = await import("../useDiaryWritingPrompt");
    expect(reloaded.drawDiaryWritingPrompt()).not.toBe(first);
  });

  it("ブラウザに履歴を書き込めない間もメモリの履歴で重複を避ける", async () => {
    const { drawDiaryWritingPrompt } = await import("../useDiaryWritingPrompt");
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });

    expect(drawDiaryWritingPrompt()).not.toBe(drawDiaryWritingPrompt());
  });
});
