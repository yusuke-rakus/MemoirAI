import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryClient } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";
import { useEffect, useState } from "react";
import { useCurrentDateStore } from "../provider/CurrentDateProvider";

export const useDiaryList = () => {
  const { localUser } = useLocalUser();
  const { date } = useCurrentDateStore();
  const [dialies, setDialies] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await DiaryClient.getByUidAndMonth(
        localUser.uid,
        date.getFullYear(),
        date.getMonth() + 1
      );
      if (!data) {
        setDialies([]);
        return;
      }

      const newDialies = data
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())
        .map((diary) => ({
          id: diary.id,
          ...(diary as Omit<Diary, "id">),
        }));
      setDialies(newDialies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { dialies, loading };
};
