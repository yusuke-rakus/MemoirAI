import { useCallback, useState } from "react";
import { toast } from "sonner";

import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import type { Diary } from "@/types/diary/diary";

export type DiaryPreviewMutationValues = Pick<
  Diary,
  "title" | "content" | "tags"
>;

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
      try {
        await DiaryClient.update({
          id: diary.id,
          uid: diary.uid,
          ...values,
        });
        await onCompleted();
        toast.success("日記を更新しました");
        return true;
      } catch (error) {
        console.error("Failed to update diary", error);
        toast.error("日記の更新に失敗しました");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [diary.id, diary.uid, onCompleted],
  );

  const deleteDiary = useCallback(async () => {
    setIsDeleting(true);
    try {
      await DiaryImageClient.deleteMany(diary.images ?? []);
      await DiaryClient.delete(diary.uid, diary.id);
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
