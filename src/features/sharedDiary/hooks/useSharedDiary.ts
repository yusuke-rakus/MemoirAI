import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { sharedDiaryQueryKeys } from "@/lib/query/queryKeys";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";

export const useSharedDiary = () => {
  const { diaryId } = useParams();
  const query = useQuery({
    queryKey: sharedDiaryQueryKeys.byShareId(diaryId ?? ""),
    enabled: Boolean(diaryId),
    queryFn: () => SharedDiaryClient.getByShareId<SharedDiary>(diaryId!),
  });

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch shared diary", query.error);
      toast.error("共有日記の取得に失敗しました");
    }
  }, [query.error]);

  return {
    diary: query.data ?? null,
    sharedDiaryId: diaryId ?? null,
    isLoading: query.isLoading && Boolean(diaryId),
  };
};
