import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { PATHS } from "@/constants/path";
import { useLocalUser } from "@/contexts/LocalUserContext";
import {
  diaryQueryKeys,
  sharedDiaryQueryKeys,
} from "@/lib/query/queryKeys";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { Diary } from "@/types/diary/diary";

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
  const { localUser } = useLocalUser();
  const queryClient = useQueryClient();
  const shareId = diary.shareId ?? diary.id;
  const shareStatusQuery = useQuery({
    queryKey: sharedDiaryQueryKeys.status(diary.uid, diary.id, shareId),
    enabled: false,
    queryFn: () => SharedDiaryClient.getActiveShareId(diary),
  });

  const shareStatus: ShareStatus = shareStatusQuery.isFetching
    ? "loading"
    : shareStatusQuery.isError
      ? "error"
      : shareStatusQuery.isSuccess
        ? shareStatusQuery.data
          ? "shared"
          : "not-shared"
        : "idle";

  const checkShareStatus = useCallback(async () => {
    if (shareStatusQuery.isSuccess || shareStatusQuery.isFetching) {
      return;
    }
    const result = await shareStatusQuery.refetch();
    if (result.error) {
      console.error("Failed to check diary share status", result.error);
      toast.error("共有状態の確認に失敗しました");
    }
  }, [shareStatusQuery]);

  const publishShareUrl = useCallback(async () => {
    const { shareId } = await SharedDiaryClient.publish(
      diary,
      localUser.displayName,
    );
    queryClient.setQueryData(
      sharedDiaryQueryKeys.status(diary.uid, diary.id, shareId),
      shareId,
    );
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: diaryQueryKeys.all(diary.uid),
        refetchType: "all",
      }),
      queryClient.invalidateQueries({
        queryKey: sharedDiaryQueryKeys.byOwner(diary.uid),
        refetchType: "all",
      }),
    ]);
    return buildShareUrl(shareId);
  }, [diary, localUser.displayName, queryClient]);

  const unshareDiary = useCallback(async () => {
    setIsUnsharing(true);
    try {
      await SharedDiaryClient.unpublish(diary);
      queryClient.setQueryData(
        sharedDiaryQueryKeys.status(diary.uid, diary.id, shareId),
        null,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: diaryQueryKeys.all(diary.uid),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: sharedDiaryQueryKeys.byOwner(diary.uid),
          refetchType: "all",
        }),
      ]);
      toast.success("共有を停止しました");
      return true;
    } catch (error) {
      console.error("Failed to unshare diary", error);
      toast.error("共有の停止に失敗しました");
      return false;
    } finally {
      setIsUnsharing(false);
    }
  }, [diary, queryClient, shareId]);

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
