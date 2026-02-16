import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryClient } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";
import { useEffect } from "react";
import { toast } from "sonner";
import { useInitialDiaryDate } from "./useInitialDiaryDate";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";

export const useFetchDiary = () => {
  const { localUser } = useLocalUser();
  const initialDate = useInitialDiaryDate();
  const { date, setDate, setUploadedDiaries, setIsLoading } =
    useDiaryDetailStore();

  useEffect(() => {
    if (date.getTime() !== initialDate.getTime()) {
      setDate(initialDate);
    }
  }, [date, initialDate, setDate]);

  useEffect(() => {
    if (!localUser?.uid) return;

    const fetchDiary = async () => {
      setIsLoading(true);
      try {
        const result =
          (await DiaryClient.getByUidAndDate<Diary>(localUser.uid, date)) ?? [];
        const sorted = result.sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
        );

        setUploadedDiaries(sorted);
      } catch (error) {
        console.error("Failed to fetch diary", error);
        toast.error("日記の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [date, localUser?.uid, setUploadedDiaries, setIsLoading]);

  const refetch = async () => {
    if (!localUser?.uid) return;
    setIsLoading(true);
    try {
      const result =
        (await DiaryClient.getByUidAndDate<Diary>(localUser.uid, date)) ?? [];
      const sorted = result.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
      );

      setUploadedDiaries(sorted);
    } catch (error) {
      console.error("Failed to fetch diary", error);
      toast.error("日記の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return { refetch };
};
