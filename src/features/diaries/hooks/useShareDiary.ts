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

const buildShareUrl = (shareId: string) =>
  `${window.location.origin}${PATHS.sharedDiary.path}/${shareId}`;

const buildLineShareUrl = (shareUrl: string) =>
  `https://liff.line.me//share?${new URLSearchParams({
    text: shareUrl,
  }).toString()}`;

export const useShareDiary = (diary: Diary) => {
  const [isSharing, setIsSharing] = useState(false);

  const publishShareUrl = useCallback(async () => {
    const { shareId } = await SharedDiaryClient.publish(diary);
    return buildShareUrl(shareId);
  }, [diary]);

  const copyShareLink = useCallback(async () => {
    setIsSharing(true);
    try {
      const shareUrl = await publishShareUrl();
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
  }, [publishShareUrl]);

  const shareToLine = useCallback(async () => {
    const lineWindow = window.open("", "_blank");

    if (lineWindow) {
      lineWindow.opener = null;
    }

    setIsSharing(true);
    try {
      const shareUrl = await publishShareUrl();
      const lineShareUrl = buildLineShareUrl(shareUrl);

      if (lineWindow) {
        lineWindow.location.replace(lineShareUrl);
      } else {
        window.location.assign(lineShareUrl);
      }
    } catch (error) {
      lineWindow?.close();
      console.error("Failed to share diary on LINE", error);
      toast.error("LINE共有の開始に失敗しました");
    } finally {
      setIsSharing(false);
    }
  }, [publishShareUrl]);

  return {
    isSharing,
    copyShareLink,
    shareToLine,
  };
};
