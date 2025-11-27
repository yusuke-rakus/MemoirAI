import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryTitleModel } from "@/firebase/models";
import { generateDiaryId } from "@/lib/generateId";
import { DiaryClient } from "@/lib/service/diaryClient";

export interface Diary {
  date: Date;
  content: string;
  tags: string[];
}

export const useCreateDiary = () => {
  const { localUser } = useLocalUser();

  const generateTitle = async (content: string) => {
    const aiResponse = await diaryTitleModel.generateContent(content);
    const text = aiResponse.response.text();
    const json = JSON.parse(text);
    return json.title;
  };

  const createDiary = async (diary: Diary) => {
    const title = await generateTitle(diary.content);

    await DiaryClient.add({
      id: generateDiaryId(),
      uid: localUser.uid,
      date: diary.date,
      title: title,
      content: diary.content,
      tags: diary.tags.map((tag) => {
        return { name: tag, color: "blue" };
      }),
      createdAt: new Date(),
    });
  };

  return { createDiary };
};
