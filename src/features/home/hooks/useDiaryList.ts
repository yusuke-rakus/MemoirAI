import { useQuery } from "@tanstack/react-query";

import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryQueryKeys } from "@/lib/query/queryKeys";
import { DiaryClient } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";

import { useCurrentDateStore } from "../provider/CurrentDateProvider";

export const useDiaryList = () => {
  const { localUser } = useLocalUser();
  const { date } = useCurrentDateStore();
  const query = useQuery({
    queryKey: diaryQueryKeys.byMonth(
      localUser.uid,
      date.getFullYear(),
      date.getMonth() + 1,
    ),
    enabled: Boolean(localUser.uid),
    queryFn: async (): Promise<Diary[]> => {
      const data = await DiaryClient.getByUidAndMonth<Diary>(
        localUser.uid,
        date.getFullYear(),
        date.getMonth() + 1,
      );
      return (data ?? [])
        .slice()
        .sort(
          (a, b) =>
            b.date.toMillis() - a.date.toMillis() ||
            b.createdAt.toMillis() - a.createdAt.toMillis(),
        );
    },
  });

  return {
    dialies: query.data ?? [],
    loading: query.isLoading && Boolean(localUser.uid),
    error: query.error,
    refetch: query.refetch,
  };
};
