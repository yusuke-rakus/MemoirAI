import { useLocalUser } from "@/contexts/LocalUserContext";
import {
  FavoriteClient,
  type FavoritePage,
  type FavoritePageCursor,
} from "@/lib/service/favoriteClient";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import { useFavoriteRefreshStore } from "@/stores/favoriteRefreshStore";
import type { Favorite } from "@/types/favorite";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetchFavoriteDiaries } from "./useFetchFavoriteDiaries";

vi.mock("@/contexts/LocalUserContext", () => ({
  useLocalUser: vi.fn(),
}));

vi.mock("@/lib/service/favoriteClient", () => ({
  FavoriteClient: {
    getByUidPaged: vi.fn(),
  },
}));

vi.mock("@/lib/service/sharedDiaryClient", () => ({
  SharedDiaryClient: {
    getByShareIds: vi.fn(),
  },
}));

vi.mock("@/stores/favoriteRefreshStore", () => ({
  useFavoriteRefreshStore: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const useLocalUserMock = vi.mocked(useLocalUser);
const getByUidPagedMock = vi.mocked(FavoriteClient.getByUidPaged);
const getByShareIdsMock = vi.mocked(SharedDiaryClient.getByShareIds);
const useFavoriteRefreshStoreMock = vi.mocked(useFavoriteRefreshStore);
const toastErrorMock = vi.mocked(toast.error);
let refreshRevision = 0;

const createCursor = (id: string) => ({ id }) as FavoritePageCursor;

const createFavorite = (sharedDiaryId: string) =>
  ({ sharedDiaryId, createdAt: { seconds: 1 } }) as Favorite;

const createPage = (
  sharedDiaryIds: string[],
  hasMore: boolean = false,
  cursor: FavoritePageCursor | null = null,
): FavoritePage => ({
  favorites: sharedDiaryIds.map(createFavorite),
  hasMore,
  cursor,
});

const createResolvedDiary = (sharedDiaryId: string) => ({
  sharedDiaryId,
  diary: { title: `${sharedDiaryId}-title` },
});

beforeEach(() => {
  refreshRevision = 0;
  useLocalUserMock.mockReturnValue({
    localUser: { uid: "user-1" },
    setLocalUser: vi.fn(),
  });
  useFavoriteRefreshStoreMock.mockImplementation((selector) =>
    selector({ revision: refreshRevision, requestRefresh: vi.fn() }),
  );
  getByUidPagedMock.mockResolvedValue(createPage([]));
  getByShareIdsMock.mockResolvedValue([]);
});

describe("useFetchFavoriteDiaries", () => {
  it("閉じている間はFirestoreへアクセスしない", () => {
    renderHook(() => useFetchFavoriteDiaries(false));

    expect(getByUidPagedMock).not.toHaveBeenCalled();
    expect(getByShareIdsMock).not.toHaveBeenCalled();
  });

  it("展開時に10件取得しfavoriteの登録順を維持する", async () => {
    const ids = Array.from({ length: 10 }, (_, index) => `shared-${index}`);
    getByUidPagedMock.mockResolvedValue(createPage(ids));
    getByShareIdsMock.mockResolvedValue(
      [...ids].reverse().map(createResolvedDiary),
    );

    const { result } = renderHook(() => useFetchFavoriteDiaries(true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(
      result.current.favoriteDiaries.map((diary) => diary.sharedDiaryId),
    ).toEqual(ids);
    expect(getByUidPagedMock).toHaveBeenCalledWith("user-1", null, 10);
  });

  it("削除済み共有日記を飛ばして10件まで補充する", async () => {
    const firstIds = Array.from(
      { length: 10 },
      (_, index) => `shared-${index}`,
    );
    const firstCursor = createCursor("cursor-1");
    getByUidPagedMock
      .mockResolvedValueOnce(createPage(firstIds, true, firstCursor))
      .mockResolvedValueOnce(
        createPage(["shared-10"], false, createCursor("cursor-2")),
      );
    getByShareIdsMock
      .mockResolvedValueOnce(firstIds.slice(0, 9).map(createResolvedDiary))
      .mockResolvedValueOnce([createResolvedDiary("shared-10")]);

    const { result } = renderHook(() => useFetchFavoriteDiaries(true));

    await waitFor(() =>
      expect(result.current.favoriteDiaries).toHaveLength(10),
    );

    expect(getByUidPagedMock).toHaveBeenNthCalledWith(
      2,
      "user-1",
      firstCursor,
      1,
    );
    expect(
      result.current.favoriteDiaries[result.current.favoriteDiaries.length - 1]
        ?.sharedDiaryId,
    ).toBe("shared-10");
  });

  it("さらに10件を既存一覧へ追加する", async () => {
    const firstCursor = createCursor("cursor-1");
    const secondCursor = createCursor("cursor-2");
    const firstIds = Array.from(
      { length: 10 },
      (_, index) => `shared-${index}`,
    );
    const secondIds = Array.from(
      { length: 10 },
      (_, index) => `shared-${index + 10}`,
    );
    getByUidPagedMock
      .mockResolvedValueOnce(createPage(firstIds, true, firstCursor))
      .mockResolvedValueOnce(createPage(secondIds, false, secondCursor));
    getByShareIdsMock
      .mockResolvedValueOnce(firstIds.map(createResolvedDiary))
      .mockResolvedValueOnce(secondIds.map(createResolvedDiary));
    const { result } = renderHook(() => useFetchFavoriteDiaries(true));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.favoriteDiaries).toHaveLength(20);
    expect(
      result.current.favoriteDiaries[result.current.favoriteDiaries.length - 1]
        ?.sharedDiaryId,
    ).toBe("shared-19");
    expect(result.current.hasMore).toBe(false);
  });

  it("追加取得中の重複操作を無視する", async () => {
    const firstCursor = createCursor("cursor-1");
    const firstIds = Array.from(
      { length: 10 },
      (_, index) => `shared-${index}`,
    );
    getByUidPagedMock.mockResolvedValueOnce(
      createPage(firstIds, true, firstCursor),
    );
    getByShareIdsMock.mockResolvedValueOnce(firstIds.map(createResolvedDiary));
    let resolveNextPage: ((page: FavoritePage) => void) | undefined;
    getByUidPagedMock.mockReturnValueOnce(
      new Promise<FavoritePage>((resolve) => {
        resolveNextPage = resolve;
      }),
    );
    const { result } = renderHook(() => useFetchFavoriteDiaries(true));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    let firstLoad: Promise<void> | undefined;
    let secondLoad: Promise<void> | undefined;
    act(() => {
      firstLoad = result.current.loadMore();
      secondLoad = result.current.loadMore();
    });

    expect(getByUidPagedMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveNextPage?.(createPage([]));
      await Promise.all([firstLoad, secondLoad]);
    });
  });

  it("favorite revision更新時に先頭pageを再取得する", async () => {
    getByUidPagedMock.mockResolvedValue(createPage([]));
    const { rerender } = renderHook(() => useFetchFavoriteDiaries(true));
    await waitFor(() => expect(getByUidPagedMock).toHaveBeenCalledOnce());

    refreshRevision += 1;
    rerender();

    await waitFor(() => expect(getByUidPagedMock).toHaveBeenCalledTimes(2));
  });

  it("取得失敗をtoastで通知する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    getByUidPagedMock.mockRejectedValue(new Error("fetch failed"));
    const { result } = renderHook(() => useFetchFavoriteDiaries(true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(toastErrorMock).toHaveBeenCalledWith(
      "お気に入りの取得に失敗しました",
    );
  });
});
