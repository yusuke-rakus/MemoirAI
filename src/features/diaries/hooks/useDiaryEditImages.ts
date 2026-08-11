import {
  MAX_DIARY_IMAGE_COUNT,
  isSupportedDiaryImageType,
} from "@/constants/diaryImages";
import { generateDiaryImageId } from "@/lib/generateId";
import type { DiaryImage } from "@/types/diary/diary";
import { useCallback, useEffect, useRef, useState } from "react";

export type NewDiaryEditImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type AddDiaryEditImagesResult = {
  addedCount: number;
  unsupportedCount: number;
  limitExceeded: boolean;
};

type UseDiaryEditImagesProps = {
  images?: DiaryImage[];
  isOpen: boolean;
};

const revokePreviewUrls = (images: NewDiaryEditImage[]) => {
  images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
};

export const useDiaryEditImages = ({
  images,
  isOpen,
}: UseDiaryEditImagesProps) => {
  const [retainedImages, setRetainedImages] = useState<DiaryImage[]>([]);
  const [newImages, setNewImages] = useState<NewDiaryEditImage[]>([]);
  const newImagesRef = useRef<NewDiaryEditImage[]>([]);

  const replaceNewImages = useCallback(
    (update: (currentImages: NewDiaryEditImage[]) => NewDiaryEditImage[]) => {
      setNewImages((currentImages) => {
        const nextImages = update(currentImages);
        newImagesRef.current = nextImages;
        return nextImages;
      });
    },
    [],
  );

  useEffect(() => {
    replaceNewImages((currentImages) => {
      revokePreviewUrls(currentImages);
      return [];
    });

    if (isOpen) {
      setRetainedImages(images ?? []);
    }
  }, [images, isOpen, replaceNewImages]);

  useEffect(
    () => () => {
      revokePreviewUrls(newImagesRef.current);
    },
    [],
  );

  const addImages = useCallback(
    (files: File[]): AddDiaryEditImagesResult => {
      const supportedFiles = files.filter((file) =>
        isSupportedDiaryImageType(file.type),
      );
      const unsupportedCount = files.length - supportedFiles.length;
      const remainingCount =
        MAX_DIARY_IMAGE_COUNT - retainedImages.length - newImages.length;
      const filesToAdd = supportedFiles.slice(0, Math.max(remainingCount, 0));
      const limitExceeded = supportedFiles.length > filesToAdd.length;

      if (filesToAdd.length === 0) {
        return {
          addedCount: 0,
          unsupportedCount,
          limitExceeded,
        };
      }

      const imagesToAdd = filesToAdd.map((file) => ({
        id: generateDiaryImageId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      replaceNewImages((currentImages) => [...currentImages, ...imagesToAdd]);

      return {
        addedCount: imagesToAdd.length,
        unsupportedCount,
        limitExceeded,
      };
    },
    [newImages.length, replaceNewImages, retainedImages.length],
  );

  const removeRetainedImage = useCallback((imageId: string) => {
    setRetainedImages((currentImages) =>
      currentImages.filter((image) => image.id !== imageId),
    );
  }, []);

  const removeNewImage = useCallback(
    (imageId: string) => {
      replaceNewImages((currentImages) => {
        const imageToRemove = currentImages.find(
          (image) => image.id === imageId,
        );
        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.previewUrl);
        }

        return currentImages.filter((image) => image.id !== imageId);
      });
    },
    [replaceNewImages],
  );

  return {
    retainedImages,
    newImages,
    imageCount: retainedImages.length + newImages.length,
    addImages,
    removeRetainedImage,
    removeNewImage,
  };
};
