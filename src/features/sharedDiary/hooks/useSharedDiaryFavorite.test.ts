import { FavoriteClient } from "@/lib/service/favoriteClient";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSharedDiaryFavorite } from "./useSharedDiaryFavorite";

vi.mock("@/lib/service/favoriteClient", () => ({
  FavoriteClient: {
    exists: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const existsMock = vi.mocked(FavoriteClient.exists);
const addMock = vi.mocked(FavoriteClient.add);
const deleteMock = vi.mocked(FavoriteClient.delete);
const toastSuccessMock = vi.mocked(toast.success);
const toastErrorMock = vi.mocked(toast.error);

const favoriteParams = {
  uid: "user-1",
  sharedDiaryId: "shared-diary-1",
};

beforeEach(() => {
  existsMock.mockResolvedValue(false);
  addMock.mockResolvedValue(undefined);
  deleteMock.mockResolvedValue(undefined);
});

describe("useSharedDiaryFavorite", () => {
  it("未認証時はFirestoreへアクセスしない", () => {
    renderHook(() =>
      useSharedDiaryFavorite({
        uid: null,
        sharedDiaryId: favoriteParams.sharedDiaryId,
      }),
    );

    expect(existsMock).not.toHaveBeenCalled();
    expect(addMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("認証済みユーザーのお気に入り状態を取得する", async () => {
    existsMock.mockResolvedValue(true);

    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(existsMock).toHaveBeenCalledWith("user-1", "shared-diary-1");
    expect(result.current.isFavorite).toBe(true);
  });

  it("未登録の日記をお気に入りへ追加する", async () => {
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(addMock).toHaveBeenCalledWith("user-1", "shared-diary-1");
    expect(result.current.isFavorite).toBe(true);
    expect(toastSuccessMock).toHaveBeenCalledWith("お気に入りに追加しました");
  });

  it("登録済みの日記をお気に入りから削除する", async () => {
    existsMock.mockResolvedValue(true);
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(deleteMock).toHaveBeenCalledWith("user-1", "shared-diary-1");
    expect(result.current.isFavorite).toBe(false);
    expect(toastSuccessMock).toHaveBeenCalledWith("お気に入りから削除しました");
  });

  it("更新失敗時はお気に入り状態を維持してエラーを通知する", async () => {
    existsMock.mockResolvedValue(true);
    deleteMock.mockRejectedValue(new Error("delete failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(result.current.isFavorite).toBe(true);
    expect(toastErrorMock).toHaveBeenCalledWith(
      "お気に入りの更新に失敗しました",
    );
  });

  it("更新中の重複操作を無視する", async () => {
    let resolveAdd: (() => void) | undefined;
    addMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveAdd = resolve;
      }),
    );
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let firstUpdate: Promise<void> | undefined;
    let secondUpdate: Promise<void> | undefined;
    act(() => {
      firstUpdate = result.current.toggleFavorite();
      secondUpdate = result.current.toggleFavorite();
    });

    expect(addMock).toHaveBeenCalledOnce();
    expect(result.current.isMutating).toBe(true);

    await act(async () => {
      resolveAdd?.();
      await Promise.all([firstUpdate, secondUpdate]);
    });

    expect(result.current.isMutating).toBe(false);
  });
});
