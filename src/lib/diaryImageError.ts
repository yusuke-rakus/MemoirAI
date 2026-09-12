const diaryImageErrorCodes = [
  "unsupported-type",
  "load-failed",
  "conversion-failed",
  "size-limit",
] as const;

export type DiaryImageErrorCode = (typeof diaryImageErrorCodes)[number];
export type DiaryImageError = Error & {
  code: DiaryImageErrorCode;
  cause?: unknown;
  contentType?: string;
};

export const createDiaryImageError = (
  code: DiaryImageErrorCode,
  message: string,
  cause?: unknown,
  contentType?: string,
): DiaryImageError =>
  Object.assign(new Error(message), {
    name: "DiaryImageError",
    code,
    cause,
    contentType,
  });

export const isDiaryImageError = (error: unknown): error is DiaryImageError =>
  error instanceof Error &&
  error.name === "DiaryImageError" &&
  "code" in error &&
  diaryImageErrorCodes.some((code) => code === error.code);

export const getDiaryImageErrorMessage = (
  error: unknown,
): string | undefined => {
  if (!isDiaryImageError(error)) return undefined;

  switch (error.code) {
    case "unsupported-type":
      return "JPEG、PNG、WebP、HEIC/HEIFの画像のみ追加できます";
    case "load-failed":
      return error.contentType === "image/heic" ||
        error.contentType === "image/heif"
        ? "このHEIC/HEIF画像を読み込めませんでした。JPEGまたはPNGに変換して追加してください"
        : "画像を読み込めませんでした。別の画像を追加してください";
    case "conversion-failed":
      return "画像を変換できませんでした。JPEGまたはPNGに変換するか、画像を小さくして追加してください";
    case "size-limit":
      return "画像を保存可能なサイズまで圧縮できませんでした。画像を小さくして追加してください";
  }
};
