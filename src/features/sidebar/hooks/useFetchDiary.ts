import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryClient, type DiaryPageCursor } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";

export const useFetchDiary = () => {
  const { localUser } = useLocalUser();
  const { uploadedDiaries, setUploadedDiaries, setIsLoading } =
    useDiaryDetailStore();
  const cursorRef = useRef<DiaryPageCursor | null>(null);
  const isLoadingMoreRef = useRef(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchFirstPage = useCallback(async () => {
    if (!localUser?.uid) return;

    setIsLoading(true);
    try {
      const page = await DiaryClient.getByUidPaged<Diary>(localUser.uid);

      cursorRef.current = page.cursor;
      setHasMore(page.hasMore);
      setUploadedDiaries(page.diaries);
    } catch (error) {
      console.error("Failed to fetch diary", error);
      toast.error("日記の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [localUser?.uid, setUploadedDiaries, setIsLoading]);

  useEffect(() => {
    cursorRef.current = null;
    setHasMore(false);
    void fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (
      !localUser?.uid ||
      !hasMore ||
      !cursorRef.current ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await DiaryClient.getByUidPaged<Diary>(
        localUser.uid,
        cursorRef.current,
      );

      cursorRef.current = page.cursor;
      setHasMore(page.hasMore);
      setUploadedDiaries([...uploadedDiaries, ...page.diaries]);
    } catch (error) {
      console.error("Failed to fetch more diaries", error);
      toast.error("日記の追加取得に失敗しました");
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, localUser?.uid, setUploadedDiaries, uploadedDiaries]);

  return {
    refetch: fetchFirstPage,
    loadMore,
    hasMore,
    isLoadingMore,
  };
};
