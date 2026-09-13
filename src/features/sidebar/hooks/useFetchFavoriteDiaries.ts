import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useLocalUser } from "@/contexts/LocalUserContext";
import { favoriteQueryKeys } from "@/lib/query/queryKeys";
import {
  FavoriteClient,
  type FavoritePageCursor,
} from "@/lib/service/favoriteClient";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";

const FAVORITE_PAGE_SIZE = 10;

export type SidebarFavoriteDiary = {
  sharedDiaryId: string;
  title: string;
};

type ResolvedFavoritePage = {
  diaries: SidebarFavoriteDiary[];
  cursor: FavoritePageCursor | null;
  hasMore: boolean;
  staleFavoriteIds: string[];
};

const fetchResolvedFavoritePage = async (
  uid: string,
  initialCursor: FavoritePageCursor | null,
): Promise<ResolvedFavoritePage> => {
  const diaries: SidebarFavoriteDiary[] = [];
  const staleFavoriteIds: string[] = [];
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

    const missingFavoriteIds = page.favorites
      .map((favorite) => favorite.sharedDiaryId)
      .filter((sharedDiaryId) => !diaryById.has(sharedDiaryId));
    staleFavoriteIds.push(...missingFavoriteIds);
    page.favorites.forEach(({ sharedDiaryId }) => {
      const diary = diaryById.get(sharedDiaryId);
      if (diary) {
        diaries.push({ sharedDiaryId, title: diary.title });
      }
    });
  }

  return { diaries, cursor, hasMore, staleFavoriteIds };
};

export const useFetchFavoriteDiaries = (isOpen: boolean) => {
  const { localUser } = useLocalUser();
  const cleanedFavoriteIdsRef = useRef(new Set<string>());
  const isLoadingMoreRef = useRef(false);
  const query = useInfiniteQuery({
    queryKey: favoriteQueryKeys.list(localUser.uid),
    enabled: isOpen && Boolean(localUser.uid),
    initialPageParam: null as FavoritePageCursor | null,
    queryFn: ({ pageParam }) =>
      fetchResolvedFavoritePage(localUser.uid, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
  });

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch favorite diaries", query.error);
      toast.error("お気に入りの取得に失敗しました");
    }
  }, [query.error]);

  useEffect(() => {
    const staleFavoriteIds = (query.data?.pages ?? [])
      .flatMap((page) => page.staleFavoriteIds)
      .filter((id) => !cleanedFavoriteIdsRef.current.has(id));
    if (staleFavoriteIds.length === 0) return;

    staleFavoriteIds.forEach((id) => cleanedFavoriteIdsRef.current.add(id));
    void Promise.allSettled(
      staleFavoriteIds.map((sharedDiaryId) =>
        FavoriteClient.delete(localUser.uid, sharedDiaryId),
      ),
    ).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to delete stale favorite: ${staleFavoriteIds[index]}`,
            result.reason,
          );
        }
      });
    });
  }, [localUser.uid, query.data]);

  return {
    favoriteDiaries: query.data?.pages.flatMap((page) => page.diaries) ?? [],
    isLoading: query.isLoading && isOpen && Boolean(localUser.uid),
    isLoadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: async () => {
      if (isLoadingMoreRef.current || !query.hasNextPage) return;
      isLoadingMoreRef.current = true;
      try {
        await query.fetchNextPage();
      } finally {
        isLoadingMoreRef.current = false;
      }
    },
  };
};
