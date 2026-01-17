import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryTitleModel } from "@/firebase/models/createDiarySchema";
import { generateDiaryId } from "@/lib/generateId";
import { DiaryClient } from "@/lib/service/diaryClient";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDiaryCard } from "./useDiaryCard";

interface Diary {
  date: Date;
  content: string;
  tags: string[];
}

export const useCreateDiary = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { localUser } = useLocalUser();
  const { cards } = useDiaryCard();

  const generateTitle = async (content: string) => {
    const aiResponse = await diaryTitleModel.generateContent(content);
    const text = aiResponse.response.text();
    const json = JSON.parse(text);
    return {
      title: json.title,
      tags: json.tags,
    };
  };

  const createDiaries = async (diaries: Diary[]): Promise<void> => {
    if (!localUser?.uid) throw new Error("No authenticated user");

    setIsCreating(true);
    try {
      // 並列でタイトルを作成
      const titlePromises = diaries.map((d) => generateTitle(d.content));
      const diaryMeta = await Promise.all(titlePromises);

      // 並列でカードの追加処理を実行
      const addPromises = diaries.map((d, i) => {
        const payload = {
          id: generateDiaryId(),
          uid: localUser.uid,
          date: d.date,
          title: diaryMeta[i].title,
          content: d.content,
          tags: diaryMeta[i].tags,
          createdAt: new Date(),
        };

        return DiaryClient.add(payload).then(() => payload.id);
      });

      await Promise.all(addPromises);
    } finally {
      setIsCreating(false);
    }
  };

  const diariesToCreate = useMemo(
    () =>
      cards.map((card) => ({
        content: card.body,
        date: card.date,
        tags: card.tags,
      })),
    [cards]
  );

  const onSave = useCallback(async () => {
    const promise = createDiaries(diariesToCreate);
    toast.promise(promise, {
      loading: "日記を作成中...",
      success: () => "日記を作成しました🎊",
      error: "日記の作成に失敗しました",
    });
    await promise;
  }, [diariesToCreate]);

  return { isCreating, onSave };
};
