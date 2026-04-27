export const MAX_DIARY_IMAGE_COUNT = 2;
export const MAX_DIARY_IMAGE_EDGE = 1600;
export const MAX_DIARY_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const DIARY_IMAGE_QUALITY = 0.82;

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
  SUPPORTED_DIARY_IMAGE_TYPES.includes(
    contentType as SupportedDiaryImageType,
  );
