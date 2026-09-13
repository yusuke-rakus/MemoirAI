import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryQueryKeys } from "@/lib/query/queryKeys";
import { DiaryClient, type DiaryPageCursor } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";

export const useFetchDiary = () => {
  const { localUser } = useLocalUser();
  const query = useInfiniteQuery({
    queryKey: diaryQueryKeys.sidebar(localUser.uid),
    enabled: Boolean(localUser.uid),
    initialPageParam: null as DiaryPageCursor | null,
    queryFn: ({ pageParam }) =>
      DiaryClient.getByUidPaged<Diary>(localUser.uid, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
  });

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch diary", query.error);
      toast.error("日記の取得に失敗しました");
    }
  }, [query.error]);

  return {
    diaries: query.data?.pages.flatMap((page) => page.diaries) ?? [],
    isLoading: query.isLoading && Boolean(localUser.uid),
    refetch: query.refetch,
    loadMore: query.fetchNextPage,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};
