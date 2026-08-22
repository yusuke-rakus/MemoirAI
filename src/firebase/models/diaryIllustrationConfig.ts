import { env } from "@/lib/env";

export const DIARY_IMAGE_MODELS = [
  "gemini-3.1-flash-lite-image",
  "gemini-3.1-flash-image",
  "gemini-3-pro-image",
] as const;

export const DIARY_IMAGE_SIZES = ["512", "1K", "2K", "4K"] as const;

export type DiaryImageModel = (typeof DIARY_IMAGE_MODELS)[number];
export type DiaryImageSize = (typeof DIARY_IMAGE_SIZES)[number];

export type DiaryIllustrationConfig = {
  model: DiaryImageModel;
  imageSize: DiaryImageSize;
};

const DEFAULT_DIARY_IMAGE_MODEL: DiaryImageModel =
  "gemini-3.1-flash-lite-image";
const DEFAULT_DIARY_IMAGE_SIZE: DiaryImageSize = "1K";

const supportedSizesByModel: Record<DiaryImageModel, DiaryImageSize[]> = {
  "gemini-3.1-flash-lite-image": ["512", "1K"],
  "gemini-3.1-flash-image": ["512", "1K", "2K", "4K"],
  "gemini-3-pro-image": ["1K", "2K", "4K"],
};

const isDiaryImageModel = (value: string): value is DiaryImageModel =>
  DIARY_IMAGE_MODELS.some((model) => model === value);

const isDiaryImageSize = (value: string): value is DiaryImageSize =>
  DIARY_IMAGE_SIZES.some((size) => size === value);

export const resolveDiaryIllustrationConfig = (
  modelValue?: string,
  imageSizeValue?: string,
): DiaryIllustrationConfig => {
  const model = modelValue?.trim() || DEFAULT_DIARY_IMAGE_MODEL;
  const imageSize = imageSizeValue?.trim() || DEFAULT_DIARY_IMAGE_SIZE;

  if (!isDiaryImageModel(model)) {
    throw new Error(`Unsupported diary image model: ${model}`);
  }

  if (!isDiaryImageSize(imageSize)) {
    throw new Error(`Unsupported diary image size: ${imageSize}`);
  }

  if (!supportedSizesByModel[model].includes(imageSize)) {
    throw new Error(
      `Diary image size ${imageSize} is not supported by ${model}`,
    );
  }

  return { model, imageSize };
};

export const diaryIllustrationConfig = resolveDiaryIllustrationConfig(
  env.diaryImageModel,
  env.diaryImageSize,
);
