import { diaryIllustrationModel } from "@/firebase/models/diaryIllustrationModel";
import type { ActiveUserMemoryContext } from "@/types/memory";

const GENERATED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

const SAFETY_BLOCK_FINISH_REASONS = [
  "SAFETY",
  "BLOCKLIST",
  "PROHIBITED_CONTENT",
  "SPII",
  "RECITATION",
  "IMAGE_SAFETY",
  "IMAGE_PROHIBITED_CONTENT",
  "IMAGE_RECITATION",
] as const;

type GeneratedImageMimeType = (typeof GENERATED_IMAGE_MIME_TYPES)[number];

export type GenerateDiaryIllustrationParams = {
  content: string;
  tags: string[];
  memoryContext: ActiveUserMemoryContext | null;
};

export type DiaryIllustrationErrorCode =
  | "generation-failed"
  | "safety-blocked"
  | "no-image"
  | "unsupported-mime"
  | "invalid-data";

export class DiaryIllustrationError extends Error {
  readonly code: DiaryIllustrationErrorCode;
  readonly cause?: unknown;

  constructor(
    code: DiaryIllustrationErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "DiaryIllustrationError";
    this.code = code;
    this.cause = cause;
  }
}

const isGeneratedImageMimeType = (
  mimeType: string,
): mimeType is GeneratedImageMimeType =>
  GENERATED_IMAGE_MIME_TYPES.some(
    (supportedType) => supportedType === mimeType,
  );

const getGeneratedImageExtension = (mimeType: GeneratedImageMimeType) => {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
};

const decodeBase64 = (data: string): ArrayBuffer => {
  const normalizedData = data.replace(/\s/g, "");
  const isValidBase64 =
    normalizedData.length > 0 &&
    normalizedData.length % 4 === 0 &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      normalizedData,
    );

  if (!isValidBase64) {
    throw new DiaryIllustrationError(
      "invalid-data",
      "Generated image data is not valid base64",
    );
  }

  try {
    const binary = atob(normalizedData);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    bytes.set(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
    return buffer;
  } catch (error) {
    throw new DiaryIllustrationError(
      "invalid-data",
      "Failed to decode generated image data",
      error,
    );
  }
};

export const createGeneratedDiaryImageFile = (
  mimeType: string,
  base64Data: string,
): File => {
  if (!isGeneratedImageMimeType(mimeType)) {
    throw new DiaryIllustrationError(
      "unsupported-mime",
      `Unsupported generated image MIME type: ${mimeType}`,
    );
  }

  const bytes = decodeBase64(base64Data);
  const extension = getGeneratedImageExtension(mimeType);

  return new File([bytes], `generated-diary-illustration.${extension}`, {
    type: mimeType,
  });
};

export class DiaryIllustrationClient {
  static async generate({
    content,
    tags,
    memoryContext,
  }: GenerateDiaryIllustrationParams): Promise<File> {
    try {
      const result = await diaryIllustrationModel.generateContent(
        JSON.stringify({
          diaryContent: content,
          tags,
          memoryContext,
        }),
      );
      const response = result.response;
      const isSafetyBlocked =
        Boolean(response.promptFeedback?.blockReason) ||
        response.candidates?.some((candidate) =>
          SAFETY_BLOCK_FINISH_REASONS.some(
            (finishReason) => finishReason === candidate.finishReason,
          ),
        );

      if (isSafetyBlocked) {
        throw new DiaryIllustrationError(
          "safety-blocked",
          "The diary illustration was blocked by a safety filter",
        );
      }

      if (
        response.candidates?.some((candidate) =>
          ["NO_IMAGE", "IMAGE_OTHER"].includes(String(candidate.finishReason)),
        )
      ) {
        throw new DiaryIllustrationError(
          "no-image",
          "The model did not generate a diary illustration",
        );
      }

      const image = response.inlineDataParts()?.[0]?.inlineData;

      if (!image) {
        throw new DiaryIllustrationError(
          "no-image",
          "The model response did not contain an image",
        );
      }

      return createGeneratedDiaryImageFile(image.mimeType, image.data);
    } catch (error) {
      if (error instanceof DiaryIllustrationError) throw error;

      throw new DiaryIllustrationError(
        "generation-failed",
        "Failed to generate a diary illustration",
        error,
      );
    }
  }
}
