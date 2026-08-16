import { FavoriteClient } from "@/lib/service/favoriteClient";
import { requestFavoriteRefresh } from "@/stores/favoriteRefreshStore";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type FavoriteMutationResult,
  useSharedDiaryFavorite,
} from "./useSharedDiaryFavorite";

vi.mock("@/lib/service/favoriteClient", () => ({
  FavoriteClient: {
    exists: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/stores/favoriteRefreshStore", () => ({
  requestFavoriteRefresh: vi.fn(),
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
const requestFavoriteRefreshMock = vi.mocked(requestFavoriteRefresh);

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
  it("未認証時はFirestoreへアクセスせずnullを返す", async () => {
    const { result } = renderHook(() =>
      useSharedDiaryFavorite({
        uid: null,
        sharedDiaryId: favoriteParams.sharedDiaryId,
      }),
    );

    await expect(result.current.toggleFavorite()).resolves.toBeNull();
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

    let mutationResult: FavoriteMutationResult = null;
    await act(async () => {
      mutationResult = await result.current.toggleFavorite();
    });

    expect(addMock).toHaveBeenCalledWith("user-1", "shared-diary-1");
    expect(mutationResult).toBe("added");
    expect(result.current.isFavorite).toBe(true);
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(requestFavoriteRefreshMock).toHaveBeenCalledOnce();
  });

  it("登録済みの日記をお気に入りから削除する", async () => {
    existsMock.mockResolvedValue(true);
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    let mutationResult: FavoriteMutationResult = null;
    await act(async () => {
      mutationResult = await result.current.toggleFavorite();
    });

    expect(deleteMock).toHaveBeenCalledWith("user-1", "shared-diary-1");
    expect(mutationResult).toBe("removed");
    expect(result.current.isFavorite).toBe(false);
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(requestFavoriteRefreshMock).toHaveBeenCalledOnce();
  });

  it("更新失敗時はお気に入り状態を維持してエラーを通知する", async () => {
    existsMock.mockResolvedValue(true);
    deleteMock.mockRejectedValue(new Error("delete failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(() => useSharedDiaryFavorite(favoriteParams));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    let mutationResult: FavoriteMutationResult = "removed";
    await act(async () => {
      mutationResult = await result.current.toggleFavorite();
    });

    expect(mutationResult).toBeNull();
    expect(result.current.isFavorite).toBe(true);
    expect(toastErrorMock).toHaveBeenCalledWith(
      "お気に入りの更新に失敗しました",
    );
    expect(requestFavoriteRefreshMock).not.toHaveBeenCalled();
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

    let firstUpdate: Promise<FavoriteMutationResult> | undefined;
    let secondUpdate: Promise<FavoriteMutationResult> | undefined;
    act(() => {
      firstUpdate = result.current.toggleFavorite();
      secondUpdate = result.current.toggleFavorite();
    });

    expect(addMock).toHaveBeenCalledOnce();
    expect(result.current.isMutating).toBe(true);

    await act(async () => {
      resolveAdd?.();
      const [firstResult, secondResult] = await Promise.all([
        firstUpdate,
        secondUpdate,
      ]);
      expect(firstResult).toBe("added");
      expect(secondResult).toBeNull();
    });

    expect(result.current.isMutating).toBe(false);
  });
});
