import { PATHS } from "@/constants/path";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { Diary } from "@/types/diary/diary";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type ShareStatus = "idle" | "loading" | "shared" | "not-shared" | "error";

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
  `https://line.me/R/share?${new URLSearchParams({
    text: shareUrl,
  }).toString()}`;

const buildXShareUrl = (shareUrl: string, title: string) =>
  `https://x.com/intent/post?${new URLSearchParams({
    text: `MemoirAIで「${title}」の日記を共有しました。\n${shareUrl}`,
  }).toString()}`;

export const useShareDiary = (diary: Diary) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const { localUser } = useLocalUser();

  const checkShareStatus = useCallback(async () => {
    if (shareStatus !== "idle" && shareStatus !== "error") {
      return;
    }

    setShareStatus("loading");
    try {
      const shareId = await SharedDiaryClient.getActiveShareId(diary);
      setShareStatus(shareId ? "shared" : "not-shared");
    } catch (error) {
      console.error("Failed to check diary share status", error);
      setShareStatus("error");
      toast.error("共有状態の確認に失敗しました");
    }
  }, [diary, shareStatus]);

  const publishShareUrl = useCallback(async () => {
    const { shareId } = await SharedDiaryClient.publish(
      diary,
      localUser.displayName,
    );
    setShareStatus("shared");
    return buildShareUrl(shareId);
  }, [diary, localUser.displayName]);

  const unshareDiary = useCallback(async () => {
    setIsUnsharing(true);
    try {
      await SharedDiaryClient.unpublish(diary);
      setShareStatus("not-shared");
      toast.success("共有を停止しました");
      return true;
    } catch (error) {
      console.error("Failed to unshare diary", error);
      toast.error("共有の停止に失敗しました");
      return false;
    } finally {
      setIsUnsharing(false);
    }
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

  const shareToX = useCallback(async () => {
    const xWindow = window.open("", "_blank");

    if (xWindow) {
      xWindow.opener = null;
    }

    setIsSharing(true);
    try {
      const shareUrl = await publishShareUrl();
      const xShareUrl = buildXShareUrl(shareUrl, diary.title);

      if (xWindow) {
        xWindow.location.replace(xShareUrl);
      } else {
        window.location.assign(xShareUrl);
      }
    } catch (error) {
      xWindow?.close();
      console.error("Failed to share diary on X", error);
      toast.error("X共有の開始に失敗しました");
    } finally {
      setIsSharing(false);
    }
  }, [diary.title, publishShareUrl]);

  return {
    isSharing,
    isUnsharing,
    isShared: shareStatus === "shared",
    isCheckingShareStatus: shareStatus === "loading",
    hasShareStatusError: shareStatus === "error",
    checkShareStatus,
    unshareDiary,
    copyShareLink,
    shareToLine,
    shareToX,
  };
};
