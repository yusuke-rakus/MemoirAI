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

      const sorted = data.sort((a, b) => b.date.toMillis() - a.date.toMillis());

      const seen = new Set<string>();
      const uniqueByDay: Diary[] = [];

      for (const diary of sorted) {
        const d = (diary as any).date?.toDate
          ? (diary as any).date.toDate()
          : (diary as any).date;
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueByDay.push({ id: diary.id, ...(diary as Omit<Diary, "id">) });
      }

      setDialies(uniqueByDay);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return { dialies, loading };
};
