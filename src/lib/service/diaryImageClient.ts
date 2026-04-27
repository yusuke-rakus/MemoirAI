import {
  DIARY_IMAGE_QUALITY,
  MAX_DIARY_IMAGE_EDGE,
  MAX_DIARY_IMAGE_UPLOAD_BYTES,
  isSupportedDiaryImageType,
} from "@/constants/diaryImages";
import { storage } from "@/firebase/firebase";
import { generateDiaryImageId } from "@/lib/generateId";
import type { DiaryImage } from "@/types/diary/diary";
import { FirebaseError } from "firebase/app";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

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

const getImageDimensions = async (file: Blob): Promise<ImageDimensions> => {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Failed to load image"));
      element.src = imageUrl;
    });

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  contentType: string,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to resize image"));
          return;
        }

        resolve(blob);
      },
      contentType,
      DIARY_IMAGE_QUALITY,
    );
  });

const resizeImage = async (
  file: File,
  dimensions: ImageDimensions,
): Promise<PreparedImage> => {
  const maxEdge = Math.max(dimensions.width, dimensions.height);
  const shouldResize = maxEdge > MAX_DIARY_IMAGE_EDGE;
  const shouldCompress = file.size >= MAX_DIARY_IMAGE_UPLOAD_BYTES;

  if (!shouldResize && !shouldCompress) {
    return {
      blob: file,
      width: dimensions.width,
      height: dimensions.height,
      contentType: file.type,
      extension: getExtension(file.type),
    };
  }

  const scale = shouldResize ? MAX_DIARY_IMAGE_EDGE / maxEdge : 1;
  const width = Math.round(dimensions.width * scale);
  const height = Math.round(dimensions.height * scale);
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Failed to load image"));
      element.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to prepare image canvas");
    }

    context.drawImage(image, 0, 0, width, height);

    const contentType = file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, contentType);

    return {
      blob,
      width,
      height,
      contentType,
      extension: getExtension(contentType),
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const prepareDiaryImage = async (file: File): Promise<PreparedImage> => {
  if (!isSupportedDiaryImageType(file.type)) {
    throw new Error("Unsupported image type");
  }

  const dimensions = await getImageDimensions(file);
  return resizeImage(file, dimensions);
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
