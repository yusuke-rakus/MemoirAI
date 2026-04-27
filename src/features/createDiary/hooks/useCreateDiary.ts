import type { TagColor } from "@/constants/tagColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryTitleModel } from "@/firebase/models/createDiarySchema";
import { generateDiaryId } from "@/lib/generateId";
import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import type { DiaryImage } from "@/types/diary/diary";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type DiaryCardImage, useDiaryCard } from "./useDiaryCard";

interface Tag {
  color: TagColor;
  name: string;
}

interface Diary {
  date: Date;
  content: string;
  tags: Tag[];
  images: DiaryCardImage[];
}

const generateTitle = async (content: string) => {
  const aiResponse = await diaryTitleModel.generateContent(content);
  const text = aiResponse.response.text();
  const json = JSON.parse(text);
  return {
    title: json.title,
    tags: json.tags,
  };
};

const uploadDiaryImages = async (
  uid: string,
  diaryId: string,
  images: DiaryCardImage[],
): Promise<DiaryImage[]> => {
  const uploadedImages: DiaryImage[] = [];

  try {
    for (const image of images) {
      const uploadedImage = await DiaryImageClient.upload({
        uid,
        diaryId,
        file: image.file,
      });
      uploadedImages.push(uploadedImage);
    }

    return uploadedImages;
  } catch (error) {
    await DiaryImageClient.deleteMany(uploadedImages).catch((deleteError) => {
      console.error("Failed to rollback uploaded diary images", deleteError);
    });
    throw error;
  }
};

export const useCreateDiary = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { localUser } = useLocalUser();
  const { cards } = useDiaryCard();

  const createDiaries = useCallback(
    async (diaries: Diary[]): Promise<void> => {
      if (!localUser?.uid) throw new Error("No authenticated user");

      setIsCreating(true);
      try {
        // 並列でタイトルを作成
        const titlePromises = diaries.map((d) => generateTitle(d.content));
        const diaryMeta = await Promise.all(titlePromises);

        // 並列でカードの追加処理を実行
        const addPromises = diaries.map(async (d, i) => {
          const mergedTags = Array.from(
            new Set([...d.tags, ...diaryMeta[i].tags]),
          );
          const diaryId = generateDiaryId();
          const uploadedImages = await uploadDiaryImages(
            localUser.uid,
            diaryId,
            d.images,
          );
          const payload = {
            id: diaryId,
            uid: localUser.uid,
            date: d.date,
            title: diaryMeta[i].title,
            content: d.content,
            tags: mergedTags,
            images: uploadedImages,
            createdAt: new Date(),
          };

          try {
            await DiaryClient.add(payload);
            return payload.id;
          } catch (error) {
            await DiaryImageClient.deleteMany(uploadedImages).catch(
              (deleteError) => {
                console.error(
                  "Failed to rollback diary images after create error",
                  deleteError,
                );
              },
            );
            throw error;
          }
        });

        await Promise.all(addPromises);
      } finally {
        setIsCreating(false);
      }
    },
    [localUser?.uid],
  );

  const diariesToCreate = useMemo(
    () =>
      cards.map((card) => ({
        content: card.body,
        date: card.date,
        tags: card.tags,
        images: card.images,
      })),
    [cards],
  );

  const onSave = useCallback(async () => {
    const promise = createDiaries(diariesToCreate);
    toast.promise(promise, {
      loading: "日記を作成中...",
      success: () => "日記を作成しました🎊",
      error: "日記の作成に失敗しました",
    });
    await promise;
  }, [createDiaries, diariesToCreate]);

  return { isCreating, onSave };
};
