import { PATHS } from "@/constants/path";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { Diary } from "@/types/diary/diary";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  await navigator.clipboard.writeText(text);
  return true;
};

export const useShareDiary = (diary: Diary) => {
  const [isSharing, setIsSharing] = useState(false);

  const onShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const { shareId } = await SharedDiaryClient.publish(diary);
      const shareUrl = `${window.location.origin}${PATHS.sharedDiary.path}/${shareId}`;
      const copied = await copyToClipboard(shareUrl);

      if (copied) {
        toast.success("共有リンクをコピーしました");
      } else {
        toast.success(`共有リンクを作成しました: ${shareUrl}`);
      }
    } catch (error) {
      console.error("Failed to share diary", error);
      toast.error("共有リンクの作成に失敗しました");
    } finally {
      setIsSharing(false);
    }
  }, [diary]);

  return {
    isSharing,
    onShare,
  };
};
