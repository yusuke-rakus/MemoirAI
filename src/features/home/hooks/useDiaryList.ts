import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryClient } from "@/lib/service/diaryClient";
import type { Diary } from "@/types/diary/diary";
import { useEffect, useState } from "react";

export const useDiaryList = () => {
  const { localUser } = useLocalUser();
  const [dialies, setDialies] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DiaryClient.getByUid(localUser.uid);
        if (data) {
          const newDialies = data
            .sort((a, b) => b.date.toMillis() - a.date.toMillis())
            .map((diary) => ({
              id: diary.id,
              ...(diary as Omit<Diary, "id">),
            }));
          setDialies(newDialies);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { dialies, loading };
};
