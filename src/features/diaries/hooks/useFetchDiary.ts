import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryQueryKeys } from "@/lib/query/queryKeys";
import { DiaryClient } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";

import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { useInitialDiaryDate } from "./useInitialDiaryDate";

export const useFetchDiary = () => {
  const { localUser } = useLocalUser();
  const initialDate = useInitialDiaryDate();
  const { date, setDate } = useDiaryDetailStore();

  useEffect(() => {
    if (date.getTime() !== initialDate.getTime()) {
      setDate(initialDate);
    }
  }, [date, initialDate, setDate]);

  const query = useQuery({
    queryKey: diaryQueryKeys.byDate(localUser.uid, date),
    enabled: Boolean(localUser.uid),
    queryFn: async (): Promise<Diary[]> =>
      (
        (await DiaryClient.getByUidAndDate<Diary>(localUser.uid, date)) ?? []
      )
        .slice()
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()),
  });

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch diary", query.error);
      toast.error("日記の取得に失敗しました");
    }
  }, [query.error]);

  return {
    diaries: query.data ?? [],
    isLoading: query.isLoading && Boolean(localUser.uid),
    error: query.error,
    refetch: async () => {
      await query.refetch();
    },
  };
};
