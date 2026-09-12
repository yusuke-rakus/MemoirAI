import { FirebaseError } from "firebase/app";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES,
  DIARY_IMAGE_MAX_QUALITY,
  DIARY_IMAGE_MIN_QUALITY,
  DIARY_IMAGE_QUALITY_SEARCH_STEPS,
  DIARY_IMAGE_TARGET_MAX_BYTES,
  isSupportedDiaryImageType,
  MAX_DIARY_IMAGE_EDGE,
  MIN_DIARY_IMAGE_EDGE,
} from "@/constants/diaryImages";
import { storage } from "@/firebase/firebase";
import {
  createDiaryImageError,
  isDiaryImageError,
} from "@/lib/diaryImageError";
import { generateDiaryImageId } from "@/lib/generateId";
import type { DiaryImage } from "@/types/diary/diary";

type UploadDiaryImageParams = {
  uid: string;
  diaryId: string;
  file: File;
};

type PreparedImage = {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
  extension: string;
};

type ImageDimensions = {
  width: number;
  height: number;
};

type CompressionAttempt = {
  blob: Blob | null;
  minimumQualitySize: number;
};

type CompressedImageType = "image/webp" | "image/jpeg";

const getExtension = (contentType: string): string => {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
};

const loadImage = async (imageUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Failed to load image"));
    element.src = imageUrl;
  });

const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  quality: number,
  contentType: CompressedImageType,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }

        resolve(blob);
      },
      contentType,
      quality,
    );
  });

const getInitialDimensions = (dimensions: ImageDimensions): ImageDimensions => {
  const maxEdge = Math.max(dimensions.width, dimensions.height);
  const scale = Math.min(1, MAX_DIARY_IMAGE_EDGE / maxEdge);

  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
  };
};

const releaseCanvas = (canvas: HTMLCanvasElement) => {
  canvas.width = 0;
  canvas.height = 0;
};

const drawImage = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  dimensions: ImageDimensions,
  contentType: CompressedImageType,
): void => {
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Failed to prepare image canvas");
  if (contentType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, dimensions.width, dimensions.height);
  }
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
};

const encodeImage = async (
  canvas: HTMLCanvasElement,
  quality: number,
  contentType: CompressedImageType,
): Promise<Blob> => {
  const blob = await canvasToBlob(canvas, quality, contentType);
  if (blob.type !== contentType)
    throw new Error("Image encoding is not supported");
  return blob;
};

const findBestCompression = async (
  canvas: HTMLCanvasElement,
  contentType: CompressedImageType,
  maximumQualityBlob: Blob,
): Promise<CompressionAttempt> => {
  if (maximumQualityBlob.size <= DIARY_IMAGE_TARGET_MAX_BYTES) {
    return {
      blob: maximumQualityBlob,
      minimumQualitySize: maximumQualityBlob.size,
    };
  }

  const minimumQualityBlob = await encodeImage(
    canvas,
    DIARY_IMAGE_MIN_QUALITY,
    contentType,
  );
  if (minimumQualityBlob.size > DIARY_IMAGE_TARGET_MAX_BYTES) {
    return {
      blob: null,
      minimumQualitySize: minimumQualityBlob.size,
    };
  }

  let bestBlob = minimumQualityBlob;
  let minimumQuality = DIARY_IMAGE_MIN_QUALITY;
  let maximumQuality = DIARY_IMAGE_MAX_QUALITY;

  for (let step = 0; step < DIARY_IMAGE_QUALITY_SEARCH_STEPS; step += 1) {
    const quality = (minimumQuality + maximumQuality) / 2;
    const candidate = await encodeImage(canvas, quality, contentType);

    if (candidate.size <= DIARY_IMAGE_TARGET_MAX_BYTES) {
      bestBlob = candidate;
      minimumQuality = quality;
    } else {
      maximumQuality = quality;
    }
  }

  return {
    blob: bestBlob,
    minimumQualitySize: minimumQualityBlob.size,
  };
};

const getReducedDimensions = (
  dimensions: ImageDimensions,
  encodedSize: number,
): ImageDimensions => {
  const maxEdge = Math.max(dimensions.width, dimensions.height);
  const estimatedScale =
    Math.sqrt(DIARY_IMAGE_TARGET_MAX_BYTES / encodedSize) * 0.95;
  const nextMaxEdge = Math.max(
    MIN_DIARY_IMAGE_EDGE,
    Math.floor(maxEdge * Math.min(0.9, estimatedScale)),
  );
  const scale = nextMaxEdge / maxEdge;

  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
  };
};

const compressImage = async (
  image: HTMLImageElement,
  originalDimensions: ImageDimensions,
): Promise<PreparedImage> => {
  let dimensions = getInitialDimensions(originalDimensions);
  let contentType: CompressedImageType = "image/webp";
  let firstEncoding = true;

  while (true) {
    const canvas = document.createElement("canvas");
    try {
      drawImage(canvas, image, dimensions, contentType);
      let maximumQualityBlob = await canvasToBlob(
        canvas,
        DIARY_IMAGE_MAX_QUALITY,
        contentType,
      );
      if (firstEncoding && maximumQualityBlob.type !== contentType) {
        contentType = "image/jpeg";
        drawImage(canvas, image, dimensions, contentType);
        maximumQualityBlob = await encodeImage(
          canvas,
          DIARY_IMAGE_MAX_QUALITY,
          contentType,
        );
      }
      firstEncoding = false;
      if (maximumQualityBlob.type !== contentType)
        throw new Error("Image encoding is not supported");
      const compression = await findBestCompression(
        canvas,
        contentType,
        maximumQualityBlob,
      );

      if (compression.blob) {
        return {
          blob: compression.blob,
          width: dimensions.width,
          height: dimensions.height,
          contentType,
          extension: getExtension(contentType),
        };
      }
      if (
        Math.max(dimensions.width, dimensions.height) <= MIN_DIARY_IMAGE_EDGE
      ) {
        throw createDiaryImageError(
          "size-limit",
          "Failed to compress image below the size limit",
        );
      }
      dimensions = getReducedDimensions(
        dimensions,
        compression.minimumQualitySize,
      );
    } finally {
      releaseCanvas(canvas);
    }
  }
};

const prepareDiaryImage = async (file: File): Promise<PreparedImage> => {
  if (!isSupportedDiaryImageType(file.type)) {
    throw createDiaryImageError(
      "unsupported-type",
      "Unsupported image type",
      undefined,
      file.type,
    );
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    let image: HTMLImageElement;
    try {
      image = await loadImage(imageUrl);
    } catch (cause) {
      throw createDiaryImageError(
        "load-failed",
        "Failed to load image",
        cause,
        file.type,
      );
    }
    const dimensions = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    const maxEdge = Math.max(dimensions.width, dimensions.height);
    const shouldCompress =
      file.size > DIARY_IMAGE_COMPRESSION_TRIGGER_BYTES ||
      maxEdge > MAX_DIARY_IMAGE_EDGE ||
      file.type === "image/heic" ||
      file.type === "image/heif";

    if (!shouldCompress) {
      return {
        blob: file,
        width: dimensions.width,
        height: dimensions.height,
        contentType: file.type,
        extension: getExtension(file.type),
      };
    }

    try {
      return await compressImage(image, dimensions);
    } catch (cause) {
      if (isDiaryImageError(cause)) throw cause;
      throw createDiaryImageError(
        "conversion-failed",
        "Failed to convert image",
        cause,
        file.type,
      );
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const isObjectNotFoundError = (error: unknown) =>
  error instanceof FirebaseError && error.code === "storage/object-not-found";

export class DiaryImageClient {
  static async upload({
    uid,
    diaryId,
    file,
  }: UploadDiaryImageParams): Promise<DiaryImage> {
    const imageId = generateDiaryImageId();
    const preparedImage = await prepareDiaryImage(file);
    const storagePath = `users/${uid}/diaries/${diaryId}/images/${imageId}.${preparedImage.extension}`;
    const imageRef = ref(storage, storagePath);

    await uploadBytes(imageRef, preparedImage.blob, {
      contentType: preparedImage.contentType,
      customMetadata: {
        originalName: file.name,
      },
    });

    const downloadURL = await getDownloadURL(imageRef);

    return {
      id: imageId,
      storagePath,
      downloadURL,
      width: preparedImage.width,
      height: preparedImage.height,
      contentType: preparedImage.contentType,
    };
  }

  static async delete(image: DiaryImage): Promise<void> {
    try {
      await deleteObject(ref(storage, image.storagePath));
    } catch (error) {
      if (isObjectNotFoundError(error)) return;

      throw error;
    }
  }

  static async deleteMany(images: DiaryImage[] = []): Promise<void> {
    await Promise.all(images.map((image) => DiaryImageClient.delete(image)));
  }
}
