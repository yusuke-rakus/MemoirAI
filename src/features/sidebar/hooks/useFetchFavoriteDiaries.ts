import { useLocalUser } from "@/contexts/LocalUserContext";
import {
  FavoriteClient,
  type FavoritePageCursor,
} from "@/lib/service/favoriteClient";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import { useFavoriteRefreshStore } from "@/stores/favoriteRefreshStore";
import type { SharedDiary } from "@/types/diary/sharedDiary";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const FAVORITE_PAGE_SIZE = 10;

export type SidebarFavoriteDiary = {
  sharedDiaryId: string;
  title: string;
};

type ResolvedFavoritePage = {
  diaries: SidebarFavoriteDiary[];
  cursor: FavoritePageCursor | null;
  hasMore: boolean;
};

const fetchResolvedFavoritePage = async (
  uid: string,
  initialCursor: FavoritePageCursor | null,
): Promise<ResolvedFavoritePage> => {
  const diaries: SidebarFavoriteDiary[] = [];
  let cursor = initialCursor;
  let hasMore = true;

  while (diaries.length < FAVORITE_PAGE_SIZE && hasMore) {
    const page = await FavoriteClient.getByUidPaged(
      uid,
      cursor,
      FAVORITE_PAGE_SIZE - diaries.length,
    );
    cursor = page.cursor;
    hasMore = page.hasMore;

    if (page.favorites.length === 0) {
      break;
    }

    const resolvedDiaries = await SharedDiaryClient.getByShareIds<SharedDiary>(
      page.favorites.map((favorite) => favorite.sharedDiaryId),
    );
    const diaryById = new Map(
      resolvedDiaries.map(({ sharedDiaryId, diary }) => [sharedDiaryId, diary]),
    );

    page.favorites.forEach(({ sharedDiaryId }) => {
      const diary = diaryById.get(sharedDiaryId);
      if (diary) {
        diaries.push({ sharedDiaryId, title: diary.title });
      }
    });
  }

  return { diaries, cursor, hasMore };
};

export const useFetchFavoriteDiaries = (isOpen: boolean) => {
  const { localUser } = useLocalUser();
  const refreshRevision = useFavoriteRefreshStore((state) => state.revision);
  const cursorRef = useRef<FavoritePageCursor | null>(null);
  const isLoadingMoreRef = useRef(false);
  const [favoriteDiaries, setFavoriteDiaries] = useState<
    SidebarFavoriteDiary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchFirstPage = useCallback(async () => {
    if (!localUser.uid) {
      cursorRef.current = null;
      setFavoriteDiaries([]);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const page = await fetchResolvedFavoritePage(localUser.uid, null);
      cursorRef.current = page.cursor;
      setFavoriteDiaries(page.diaries);
      setHasMore(page.hasMore);
    } catch (error) {
      console.error("Failed to fetch favorite diaries", error);
      toast.error("お気に入りの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [localUser.uid]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchFirstPage();
  }, [fetchFirstPage, isOpen, refreshRevision]);

  const loadMore = useCallback(async () => {
    if (
      !localUser.uid ||
      !hasMore ||
      !cursorRef.current ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await fetchResolvedFavoritePage(
        localUser.uid,
        cursorRef.current,
      );
      cursorRef.current = page.cursor;
      setFavoriteDiaries((currentDiaries) => [
        ...currentDiaries,
        ...page.diaries,
      ]);
      setHasMore(page.hasMore);
    } catch (error) {
      console.error("Failed to fetch more favorite diaries", error);
      toast.error("お気に入りの追加取得に失敗しました");
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, localUser.uid]);

  return {
    favoriteDiaries,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
};
