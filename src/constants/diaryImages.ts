export const MAX_DIARY_IMAGE_COUNT = 2;
export const MAX_DIARY_IMAGE_EDGE = 1600;
export const MIN_DIARY_IMAGE_EDGE = 320;
export const DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES = 700 * 1024;
export const DIARY_IMAGE_TARGET_MAX_BYTES = 500 * 1024;
export const DIARY_IMAGE_MAX_QUALITY = 0.82;
export const DIARY_IMAGE_MIN_QUALITY = 0.6;
export const DIARY_IMAGE_QUALITY_SEARCH_STEPS = 5;

export const SUPPORTED_DIARY_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type SupportedDiaryImageType =
  (typeof SUPPORTED_DIARY_IMAGE_TYPES)[number];

export const isSupportedDiaryImageType = (
  contentType: string,
): contentType is SupportedDiaryImageType =>
  SUPPORTED_DIARY_IMAGE_TYPES.includes(contentType as SupportedDiaryImageType);
