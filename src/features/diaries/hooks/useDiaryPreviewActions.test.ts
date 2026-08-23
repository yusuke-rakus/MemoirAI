import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { Diary } from "@/types/diary/diary";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiaryPreviewActions } from "./useDiaryPreviewActions";

vi.mock("@/lib/service/diaryClient", () => ({
  DiaryClient: {
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/service/diaryImageClient", () => ({
  DiaryImageClient: {
    deleteMany: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock("@/lib/service/sharedDiaryClient", () => ({
  SharedDiaryClient: {
    unpublish: vi.fn(),
  },
}));

vi.mock("@/stores/diarySearchStore", () => ({
  invalidateDiarySearchCache: vi.fn(),
}));

vi.mock("@/stores/diaryRefreshStore", () => ({
  requestDiaryRefresh: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

const diary = {
  id: "diary-1",
  uid: "user-1",
  title: "夏の思い出",
  content: "海へ行きました。",
  tags: [],
  images: [{ id: "image-1" }],
  date: {},
  createdAt: {},
} as unknown as Diary;

const unpublishMock = vi.mocked(SharedDiaryClient.unpublish);
const deleteDiaryMock = vi.mocked(DiaryClient.delete);
const deleteImagesMock = vi.mocked(DiaryImageClient.deleteMany);
const toastErrorMock = vi.mocked(toast.error);
const toastWarningMock = vi.mocked(toast.warning);

beforeEach(() => {
  vi.clearAllMocks();
  unpublishMock.mockResolvedValue({ wasShared: true });
  deleteDiaryMock.mockResolvedValue(undefined);
  deleteImagesMock.mockResolvedValue(undefined);
});

describe("useDiaryPreviewActions deleteDiary", () => {
  it("共有停止、日記削除、画像整理の順に実行する", async () => {
    const onCompleted = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDiaryPreviewActions({ diary, onCompleted }),
    );

    let isDeleted = false;
    await act(async () => {
      isDeleted = await result.current.deleteDiary();
    });

    expect(isDeleted).toBe(true);
    expect(unpublishMock).toHaveBeenCalledWith(diary);
    expect(deleteDiaryMock).toHaveBeenCalledWith("user-1", "diary-1");
    expect(deleteImagesMock).toHaveBeenCalledWith(diary.images);
    expect(unpublishMock.mock.invocationCallOrder[0]).toBeLessThan(
      deleteDiaryMock.mock.invocationCallOrder[0] ?? 0,
    );
    expect(deleteDiaryMock.mock.invocationCallOrder[0]).toBeLessThan(
      deleteImagesMock.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("共有停止に失敗した場合は日記と画像を削除しない", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    unpublishMock.mockRejectedValue(new Error("unpublish failed"));
    const { result } = renderHook(() =>
      useDiaryPreviewActions({ diary, onCompleted: vi.fn() }),
    );

    await act(async () => {
      await result.current.deleteDiary();
    });

    expect(deleteDiaryMock).not.toHaveBeenCalled();
    expect(deleteImagesMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith("日記の削除に失敗しました");
  });

  it("共有停止後に日記削除が失敗した場合は部分成功を通知する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    deleteDiaryMock.mockRejectedValue(new Error("delete failed"));
    const { result } = renderHook(() =>
      useDiaryPreviewActions({ diary, onCompleted: vi.fn() }),
    );

    await act(async () => {
      await result.current.deleteDiary();
    });

    expect(deleteImagesMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "共有は停止しましたが、日記の削除に失敗しました",
    );
  });

  it("日記削除後の画像整理失敗は警告し、削除成功として扱う", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    deleteImagesMock.mockRejectedValue(new Error("image delete failed"));
    const { result } = renderHook(() =>
      useDiaryPreviewActions({ diary, onCompleted: vi.fn() }),
    );

    let isDeleted = false;
    await act(async () => {
      isDeleted = await result.current.deleteDiary();
    });

    expect(isDeleted).toBe(true);
    expect(toastWarningMock).toHaveBeenCalledWith(
      "日記を削除しましたが、画像の整理に失敗しました",
    );
  });
});
