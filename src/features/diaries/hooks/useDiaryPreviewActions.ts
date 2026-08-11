import { useCallback, useState } from "react";
import { toast } from "sonner";

import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import type { Diary, DiaryImage } from "@/types/diary/diary";
import { Timestamp } from "firebase/firestore";
import { invalidateDiarySearchCache } from "@/stores/diarySearchStore";
import { requestDiaryRefresh } from "@/stores/diaryRefreshStore";

export type DiaryPreviewMutationValues = Pick<
  Diary,
  "title" | "content" | "tags"
> & {
  date: Date;
  retainedImages: DiaryImage[];
  newImageFiles: File[];
};

type UseDiaryPreviewActionsProps = {
  diary: Diary;
  onCompleted: () => Promise<void>;
};

export const useDiaryPreviewActions = ({
  diary,
  onCompleted,
}: UseDiaryPreviewActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateDiary = useCallback(
    async (values: DiaryPreviewMutationValues) => {
      setIsUpdating(true);
      const uploadedImages: DiaryImage[] = [];

      try {
        for (const file of values.newImageFiles) {
          const uploadedImage = await DiaryImageClient.upload({
            uid: diary.uid,
            diaryId: diary.id,
            file,
          });
          uploadedImages.push(uploadedImage);
        }

        await DiaryClient.update({
          id: diary.id,
          uid: diary.uid,
          date: Timestamp.fromDate(values.date),
          title: values.title,
          content: values.content,
          tags: values.tags,
          images: [...values.retainedImages, ...uploadedImages],
        });
        invalidateDiarySearchCache();
        requestDiaryRefresh();
      } catch (error) {
        await DiaryImageClient.deleteMany(uploadedImages).catch(
          (deleteError) => {
            console.error(
              "Failed to rollback uploaded diary images",
              deleteError,
            );
          },
        );
        console.error("Failed to update diary", error);
        toast.error("日記の更新に失敗しました");
        setIsUpdating(false);
        return false;
      }

      const retainedImageIds = new Set(
        values.retainedImages.map((image) => image.id),
      );
      const removedImages = (diary.images ?? []).filter(
        (image) => !retainedImageIds.has(image.id),
      );

      try {
        await DiaryImageClient.deleteMany(removedImages);
        toast.success("日記を更新しました");
      } catch (error) {
        console.error("Failed to delete removed diary images", error);
        toast.warning("日記を更新しましたが、削除した画像の整理に失敗しました");
      } finally {
        setIsUpdating(false);
      }

      return true;
    },
    [diary.id, diary.images, diary.uid],
  );

  const deleteDiary = useCallback(async () => {
    setIsDeleting(true);
    try {
      await DiaryImageClient.deleteMany(diary.images ?? []);
      await DiaryClient.delete(diary.uid, diary.id);
      invalidateDiarySearchCache();
      requestDiaryRefresh();
      await onCompleted();
      toast.success("日記を削除しました");
      return true;
    } catch (error) {
      console.error("Failed to delete diary", error);
      toast.error("日記の削除に失敗しました");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [diary.id, diary.images, diary.uid, onCompleted]);

  return {
    isUpdating,
    isDeleting,
    updateDiary,
    deleteDiary,
  };
};
