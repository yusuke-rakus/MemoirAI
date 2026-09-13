import { FirebaseError } from "firebase/app";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/firebase/firebase";
import { generateDiaryImageId } from "@/lib/generateId";
import { prepareDiaryImage } from "@/lib/prepareDiaryImage";
import type { DiaryImage } from "@/types/diary/diary";

type UploadDiaryImageParams = {
  uid: string;
  diaryId: string;
  file: File;
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
