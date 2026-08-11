import type { TagColor } from "@/constants/tagColors";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryTitleModel } from "@/firebase/models/createDiarySchema";
import { memoryExtractionModel } from "@/firebase/models/memoryExtractionSchema";
import { generateDiaryId } from "@/lib/generateId";
import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import { UserMemoryClient } from "@/lib/service/userMemoryClient";
import { invalidateDiarySearchCache } from "@/stores/diarySearchStore";
import { requestDiaryRefresh } from "@/stores/diaryRefreshStore";
import type { DiaryImage } from "@/types/diary/diary";
import type {
  ActiveUserMemoryContext,
  ExtractedUserMemory,
} from "@/types/memory";
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

type DiaryMeta = {
  title: string;
  tags: Tag[];
};

type DiaryMetaResponse = {
  title: string;
  tags?: Tag[];
};

type DiaryPreparation = {
  diary: Diary;
  diaryId: string;
  metaPromise: Promise<DiaryMeta>;
  memoryPromise: Promise<ExtractedUserMemory | null>;
};

type CreatedDiaryMemoryPayload = {
  uid: string;
  memoryPromise: Promise<ExtractedUserMemory | null>;
};

const generateTitle = async (
  content: string,
  selectedTags: string[],
  memoryContext: ActiveUserMemoryContext | null,
) => {
  const aiResponse = await diaryTitleModel.generateContent(
    JSON.stringify({
      diaryContent: content,
      selectedTags,
      memoryContext,
    }),
  );
  const text = aiResponse.response.text();
  const json = JSON.parse(text) as DiaryMetaResponse;
  return {
    title: json.title,
    tags: json.tags ?? [],
  };
};

const extractDiaryMemory = async (
  content: string,
  memoryContext: ActiveUserMemoryContext | null,
) => {
  const aiResponse = await memoryExtractionModel.generateContent(
    JSON.stringify({
      diaryContent: content,
      memoryContext,
    }),
  );
  const text = aiResponse.response.text();

  return JSON.parse(text) as ExtractedUserMemory;
};

const normalizeTagName = (name: string) =>
  name.trim().toLocaleLowerCase("ja-JP");

const mergeTags = (selectedTags: Tag[], generatedTags: Tag[]): Tag[] => {
  const tagsByName = new Map<string, Tag>();

  [...selectedTags, ...generatedTags].forEach((tag) => {
    const name = tag.name.trim();
    const normalizedName = normalizeTagName(name);
    if (!normalizedName || tagsByName.has(normalizedName)) return;

    tagsByName.set(normalizedName, {
      ...tag,
      name,
    });
  });

  return Array.from(tagsByName.values());
};

const getActiveMemoryContext = async (uid: string) => {
  try {
    return await UserMemoryClient.getActiveMemoryContext(uid);
  } catch (error) {
    console.error("Failed to fetch active memory context", error);
    return null;
  }
};

const prepareDiary = (
  diary: Diary,
  memoryContextPromise: Promise<ActiveUserMemoryContext | null>,
): DiaryPreparation => {
  const diaryId = generateDiaryId();

  return {
    diary,
    diaryId,
    metaPromise: memoryContextPromise.then((memoryContext) =>
      generateTitle(
        diary.content,
        diary.tags.map((tag) => tag.name),
        memoryContext,
      ),
    ),
    memoryPromise: memoryContextPromise
      .then((memoryContext) => extractDiaryMemory(diary.content, memoryContext))
      .catch((error) => {
        console.error("Failed to extract diary memory", error);
        return null;
      }),
  };
};

const saveDiaryMemory = async ({
  uid,
  memoryPromise,
}: CreatedDiaryMemoryPayload) => {
  const extracted = await memoryPromise;
  if (!extracted) return;

  await UserMemoryClient.mergeExtractedMemory({
    uid,
    extracted,
  });
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
        const memoryContextPromise = getActiveMemoryContext(localUser.uid);
        const diaryPreparations = diaries.map((diary) =>
          prepareDiary(diary, memoryContextPromise),
        );

        // 並列でカードの追加処理を実行
        const addPromises = diaryPreparations.map(async (preparation) => {
          const { diary, diaryId, memoryPromise, metaPromise } = preparation;
          const diaryMeta = await metaPromise;
          const mergedTags = mergeTags(diary.tags, diaryMeta.tags);
          const uploadedImages = await uploadDiaryImages(
            localUser.uid,
            diaryId,
            diary.images,
          );
          const payload = {
            id: diaryId,
            uid: localUser.uid,
            date: diary.date,
            title: diaryMeta.title,
            content: diary.content,
            tags: mergedTags,
            images: uploadedImages,
            createdAt: new Date(),
          };

          try {
            await DiaryClient.add(payload);
            return {
              uid: payload.uid,
              memoryPromise,
            };
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

        const createdDiaries = await Promise.all(addPromises);

        for (const diary of createdDiaries) {
          try {
            await saveDiaryMemory(diary);
          } catch (error) {
            console.error("Failed to save diary memory", error);
          }
        }
        invalidateDiarySearchCache();
        requestDiaryRefresh();
      } finally {
        setIsCreating(false);
      }
    },
    [localUser?.uid],
  );

  const diariesToCreate = useMemo(
    () =>
      cards
        .filter((card) => card.body.trim())
        .map((card) => ({
          content: card.body.trim(),
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
