import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGuestDiary } from "../useGuestDiary";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  write: vi.fn(),
  draft: vi.fn(),
  metadata: vi.fn(),
  illustration: vi.fn(),
}));
vi.mock("@/lib/service/guestDiaryClient", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/service/guestDiaryClient")>();
  return {
    ...actual,
    GuestDiaryClient: {
      load: mocks.load,
      write: mocks.write,
      saveDraft: mocks.draft,
      exclusive: (operation: () => Promise<unknown>) => operation(),
    },
  };
});
vi.mock("@/lib/service/diaryMetadataClient", () => ({
  DiaryMetadataClient: { generate: mocks.metadata },
}));
vi.mock("@/lib/service/diaryIllustrationClient", () => ({
  DiaryIllustrationClient: { generate: mocks.illustration },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

beforeEach(() => {
  mocks.load.mockReset().mockResolvedValue(null);
  mocks.write.mockReset().mockResolvedValue(undefined);
  mocks.draft.mockReset().mockResolvedValue(undefined);
  mocks.metadata.mockReset().mockResolvedValue({ title: "🌳散歩", tags: [] });
  mocks.illustration.mockReset();
});

describe("useGuestDiary persistence", () => {
  it("生成成功後の端末保存が失敗した場合は同じ結果の保存を再試行しAIを再実行しない", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.write
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("quota exceeded"));
    const { result } = renderHook(() => useGuestDiary());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    act(() =>
      result.current.setDraft({
        date: "2026-10-03T00:00:00Z",
        content: "公園を散歩した",
        tags: [],
      }),
    );
    await act(async () => result.current.create());
    expect(result.current.diary).toBeNull();
    expect(result.current.hasPreparedResult).toBe(true);
    const original = mocks.write.mock.calls[1][0].diary;
    await act(async () => result.current.create());
    expect(result.current.diary?.id).toBe(original.id);
    expect(result.current.hasPreparedResult).toBe(false);
    expect(mocks.metadata).toHaveBeenCalledTimes(1);
    expect(mocks.write.mock.calls[2][0].diary.id).toBe(original.id);
  });

  it("作成が重複して呼ばれてもAI生成と作成結果の保存は一度だけ行う", async () => {
    const { result } = renderHook(() => useGuestDiary());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    act(() =>
      result.current.setDraft({
        date: "2026-10-03T00:00:00Z",
        content: "公園を散歩した",
        tags: [],
      }),
    );
    await act(async () =>
      Promise.all([result.current.create(), result.current.create()]),
    );
    expect(mocks.metadata).toHaveBeenCalledTimes(1);
    expect(
      mocks.write.mock.calls.filter(([record]) => record.diary),
    ).toHaveLength(1);
  });
});
