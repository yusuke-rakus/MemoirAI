import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export const useSharedDiary = () => {
  const { diaryId } = useParams();
  const [diary, setDiary] = useState<SharedDiary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!diaryId) {
      setDiary(null);
      setIsLoading(false);
      return;
    }

    const fetchSharedDiary = async () => {
      setIsLoading(true);
      try {
        const sharedDiary = await SharedDiaryClient.getByShareId<SharedDiary>(diaryId);
        setDiary(sharedDiary);
      } catch (error) {
        console.error("Failed to fetch shared diary", error);
        toast.error("共有日記の取得に失敗しました");
        setDiary(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSharedDiary();
  }, [diaryId]);

  return { diary, isLoading };
};
