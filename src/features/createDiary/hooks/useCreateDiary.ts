import type { TagColor } from "@/constants/tagColors";
import { MAX_DIARY_IMAGE_COUNT } from "@/constants/diaryImages";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { diaryTitleModel } from "@/firebase/models/createDiarySchema";
import { memoryExtractionModel } from "@/firebase/models/memoryExtractionSchema";
import { generateDiaryId } from "@/lib/generateId";
import { DiaryClient } from "@/lib/service/diaryClient";
import {
  DiaryIllustrationClient,
  DiaryIllustrationError,
} from "@/lib/service/diaryIllustrationClient";
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
import type { DiarySaveMode } from "../types";

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
  illustrationPromise: Promise<File | null>;
};

type PreparedDiary = DiaryPreparation & {
  diaryMeta: DiaryMeta;
  illustrationFile: File | null;
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
  saveMode: DiarySaveMode,
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
    illustrationPromise:
      saveMode === "illustrated"
        ? memoryContextPromise.then((memoryContext) =>
            DiaryIllustrationClient.generate({
              content: diary.content,
              tags: diary.tags.map((tag) => tag.name),
              memoryContext,
            }),
          )
        : Promise.resolve(null),
  };
};

const completeDiaryPreparation = async (
  preparation: DiaryPreparation,
): Promise<PreparedDiary> => {
  const [diaryMeta, illustrationFile] = await Promise.all([
    preparation.metaPromise,
    preparation.illustrationPromise,
  ]);

  return {
    ...preparation,
    diaryMeta,
    illustrationFile,
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
  files: File[],
): Promise<DiaryImage[]> => {
  const uploadedImages: DiaryImage[] = [];

  try {
    for (const file of files) {
      const uploadedImage = await DiaryImageClient.upload({
        uid,
        diaryId,
        file,
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
  const [createPhase, setCreatePhase] = useState<
    "idle" | "generating" | "saving"
  >("idle");
  const { localUser } = useLocalUser();
  const { cards } = useDiaryCard();

  const createDiaries = useCallback(
    async (diaries: Diary[], saveMode: DiarySaveMode): Promise<void> => {
      if (!localUser?.uid) throw new Error("No authenticated user");
      if (
        saveMode === "illustrated" &&
        diaries.some((diary) => diary.images.length >= MAX_DIARY_IMAGE_COUNT)
      ) {
        throw new Error("生成画像を追加するには画像を1枚削除してください");
      }

      setCreatePhase(saveMode === "illustrated" ? "generating" : "saving");
      try {
        const memoryContextPromise = getActiveMemoryContext(localUser.uid);
        const diaryPreparations = diaries.map((diary) =>
          prepareDiary(diary, memoryContextPromise, saveMode),
        );
        const preparedDiaries = await Promise.all(
          diaryPreparations.map(completeDiaryPreparation),
        );

        setCreatePhase("saving");

        // 並列でカードの追加処理を実行
        const addPromises = preparedDiaries.map(async (preparation) => {
          const { diary, diaryId, diaryMeta, illustrationFile, memoryPromise } =
            preparation;
          const mergedTags = mergeTags(diary.tags, diaryMeta.tags);
          const files = [
            ...(illustrationFile ? [illustrationFile] : []),
            ...diary.images.map((image) => image.file),
          ];
          const uploadedImages = await uploadDiaryImages(
            localUser.uid,
            diaryId,
            files,
          );
          const now = new Date();
          const payload = {
            id: diaryId,
            uid: localUser.uid,
            date: diary.date,
            title: diaryMeta.title,
            content: diary.content,
            tags: mergedTags,
            images: uploadedImages,
            createdAt: now,
            updatedAt: now,
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
        setCreatePhase("idle");
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

  const onSave = useCallback(
    async (saveMode: DiarySaveMode) => {
      const promise = createDiaries(diariesToCreate, saveMode);
      toast.promise(promise, {
        loading:
          saveMode === "illustrated" ? "絵日記を作成中..." : "日記を作成中...",
        success: () => "日記を作成しました🎊",
        error: (error) =>
          error instanceof DiaryIllustrationError
            ? "画像を生成できませんでした。再試行するか、通常保存に切り替えてください"
            : "日記の作成に失敗しました",
      });
      await promise;
    },
    [createDiaries, diariesToCreate],
  );

  return {
    createPhase,
    isCreating: createPhase !== "idle",
    onSave,
  };
};
