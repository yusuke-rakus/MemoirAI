import { useCallback, useState } from "react";
import { toast } from "sonner";

import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
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
          updatedAt: Timestamp.now(),
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
    let wasShared = false;

    try {
      const unshareResult = await SharedDiaryClient.unpublish(diary);
      wasShared = unshareResult.wasShared;
      await DiaryClient.delete(diary.uid, diary.id);
      invalidateDiarySearchCache();
      requestDiaryRefresh();
      await onCompleted();
    } catch (error) {
      console.error("Failed to delete diary", error);
      toast.error(
        wasShared
          ? "共有は停止しましたが、日記の削除に失敗しました"
          : "日記の削除に失敗しました",
      );
      setIsDeleting(false);
      return false;
    }

    try {
      await DiaryImageClient.deleteMany(diary.images ?? []);
      toast.success("日記を削除しました");
    } catch (error) {
      console.error("Failed to delete diary images", error);
      toast.warning("日記を削除しましたが、画像の整理に失敗しました");
    } finally {
      setIsDeleting(false);
    }

    return true;
  }, [diary, onCompleted]);

  return {
    isUpdating,
    isDeleting,
    updateDiary,
    deleteDiary,
  };
};
