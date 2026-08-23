import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { Diary } from "@/types/diary/diary";
import { useShareDiary } from "./useShareDiary";

vi.mock("@/contexts/LocalUserContext", () => ({
  useLocalUser: () => ({
    localUser: {
      uid: "user-1",
      displayName: "テストユーザー",
    },
  }),
}));

vi.mock("@/lib/service/sharedDiaryClient", () => ({
  SharedDiaryClient: {
    getActiveShareId: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const diary: Diary = {
  id: "diary-1",
  uid: "user-1",
  date: {} as Diary["date"],
  title: "夏の思い出",
  content: "海へ行きました。",
  tags: [],
  createdAt: {} as Diary["createdAt"],
};

const publishMock = vi.mocked(SharedDiaryClient.publish);
const getActiveShareIdMock = vi.mocked(SharedDiaryClient.getActiveShareId);
const unpublishMock = vi.mocked(SharedDiaryClient.unpublish);
const toastSuccessMock = vi.mocked(toast.success);
const toastErrorMock = vi.mocked(toast.error);

const createPopup = () => {
  const replace = vi.fn();
  const close = vi.fn();
  const popup = {
    opener: window,
    location: { replace },
    close,
  } as unknown as Window;

  return { popup, replace, close };
};

describe("useShareDiary", () => {
  it("共有メニューを開いたときに共有状態を取得する", async () => {
    getActiveShareIdMock.mockResolvedValue("share-active");
    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.checkShareStatus();
    });

    expect(getActiveShareIdMock).toHaveBeenCalledWith(diary);
    expect(result.current.isShared).toBe(true);
    expect(result.current.isCheckingShareStatus).toBe(false);
  });

  it("共有停止後に状態を更新して成功を通知する", async () => {
    getActiveShareIdMock.mockResolvedValue("share-active");
    unpublishMock.mockResolvedValue({ wasShared: true });
    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.checkShareStatus();
      await result.current.unshareDiary();
    });

    expect(unpublishMock).toHaveBeenCalledWith(diary);
    expect(result.current.isShared).toBe(false);
    expect(toastSuccessMock).toHaveBeenCalledWith("共有を停止しました");
  });

  it("共有停止に失敗した場合は共有中の状態を維持する", async () => {
    getActiveShareIdMock.mockResolvedValue("share-active");
    unpublishMock.mockRejectedValue(new Error("unpublish failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.checkShareStatus();
    });
    await act(async () => {
      await result.current.unshareDiary();
    });

    expect(result.current.isShared).toBe(true);
    expect(toastErrorMock).toHaveBeenCalledWith("共有の停止に失敗しました");
  });

  it("公開した共有URLをclipboardへコピーし、処理中状態を更新する", async () => {
    let resolvePublish: ((value: { shareId: string }) => void) | undefined;
    const publishPromise = new Promise<{ shareId: string }>((resolve) => {
      resolvePublish = resolve;
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    publishMock.mockReturnValue(publishPromise);
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });

    const { result } = renderHook(() => useShareDiary(diary));
    let copyPromise: Promise<void> | undefined;

    act(() => {
      copyPromise = result.current.copyShareLink();
    });

    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      resolvePublish?.({ shareId: "share-1" });
      await copyPromise;
    });

    expect(publishMock).toHaveBeenCalledWith(diary, "テストユーザー");
    expect(writeText).toHaveBeenCalledWith(
      "https://memoir.test/shared/share-1",
    );
    expect(toastSuccessMock).toHaveBeenCalledWith("共有リンクをコピーしました");
    expect(result.current.isSharing).toBe(false);
  });

  it("clipboard非対応時は作成した共有URLをtoastへ表示する", async () => {
    publishMock.mockResolvedValue({ shareId: "share-2" });
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.copyShareLink();
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "共有リンクを作成しました: https://memoir.test/shared/share-2",
    );
  });

  it("LINEアプリの送信先選択画面を安全なpopupで開く", async () => {
    const { popup, replace } = createPopup();
    publishMock.mockResolvedValue({ shareId: "share-line" });
    vi.spyOn(window, "open").mockReturnValue(popup);

    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.shareToLine();
    });

    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(popup.opener).toBeNull();

    const lineUrl = new URL(String(replace.mock.calls[0]?.[0]));
    expect(`${lineUrl.origin}${lineUrl.pathname}`).toBe(
      "https://line.me/R/share",
    );
    expect(lineUrl.searchParams.get("text")).toBe(
      "https://memoir.test/shared/share-line",
    );
  });

  it("日記タイトルと共有URLを含むXの共有画面を開く", async () => {
    const { popup, replace } = createPopup();
    publishMock.mockResolvedValue({ shareId: "share-x" });
    vi.spyOn(window, "open").mockReturnValue(popup);

    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.shareToX();
    });

    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(popup.opener).toBeNull();

    const xUrl = new URL(String(replace.mock.calls[0]?.[0]));
    expect(`${xUrl.origin}${xUrl.pathname}`).toBe("https://x.com/intent/post");
    expect(xUrl.searchParams.get("text")).toBe(
      "MemoirAIで「夏の思い出」の日記を共有しました。\nhttps://memoir.test/shared/share-x",
    );
  });

  it("公開に失敗した場合はpopupを閉じ、エラーを通知する", async () => {
    const { popup, close } = createPopup();
    publishMock.mockRejectedValue(new Error("publish failed"));
    vi.spyOn(window, "open").mockReturnValue(popup);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => useShareDiary(diary));

    await act(async () => {
      await result.current.shareToLine();
    });

    expect(close).toHaveBeenCalledOnce();
    expect(toastErrorMock).toHaveBeenCalledWith("LINE共有の開始に失敗しました");
    expect(result.current.isSharing).toBe(false);
  });
});
