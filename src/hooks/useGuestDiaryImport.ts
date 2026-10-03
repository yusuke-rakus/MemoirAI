import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { auth } from "@/firebase/firebase";
import { diaryQueryKeys } from "@/lib/query/queryKeys";
import { DiaryClient } from "@/lib/service/diaryClient";
import { DiaryImageClient } from "@/lib/service/diaryImageClient";
import { GuestDiaryClient } from "@/lib/service/guestDiaryClient";

const performGuestDiaryImport = async (
  uid: string,
  currentUid: () => string | undefined,
): Promise<string | null> => {
  if (!uid) throw new Error("uid is required.");
  // Avoid requiring Web Locks for normal users with no guest diary.
  if (!navigator.locks && !(await GuestDiaryClient.load())?.diary) return null;
  return GuestDiaryClient.exclusive(async () => {
    const record = await GuestDiaryClient.load();
    if (!record?.diary) return null;
    const assertSession = () => {
      if (currentUid() !== uid)
        throw new Error(
          "ログイン状態が変わりました。再度ログインしてください。",
        );
    };
    assertSession();
    const diary = record.diary;
    if (diary.targetUid && diary.targetUid !== uid) {
      throw new Error(
        "この日記は別のアカウントへの保存を開始しています。そのアカウントでログインしてください。",
      );
    }
    if (!diary.targetUid) {
      diary.targetUid = uid;
      await GuestDiaryClient.write(record);
    }
    assertSession();
    if (!(await DiaryClient.exists(uid, diary.id))) {
      assertSession();
      const images = diary.image
        ? [
            await DiaryImageClient.upload({
              uid,
              diaryId: diary.id,
              imageId: diary.imageId,
              file: new File([diary.image], "guest-diary-illustration", {
                type: diary.image.type,
              }),
            }),
          ]
        : [];
      assertSession();
      await DiaryClient.addIfAbsent({
        id: diary.id,
        uid,
        date: new Date(diary.date),
        title: diary.title,
        content: diary.content,
        tags: diary.tags,
        images,
        createdAt: new Date(diary.createdAt),
        updatedAt: new Date(diary.createdAt),
      });
    }
    assertSession();
    // Retain the record on any uncertain outcome. A retry first checks Firestore.
    await GuestDiaryClient.clear();
    return diary.date;
  });
};

const inFlightImports = new Map<string, Promise<string | null>>();

export const importGuestDiary = (
  uid: string,
  currentUid: () => string | undefined,
): Promise<string | null> => {
  const existing = inFlightImports.get(uid);
  if (existing) return existing;
  const operation = performGuestDiaryImport(uid, currentUid).finally(() => {
    inFlightImports.delete(uid);
  });
  inFlightImports.set(uid, operation);
  return operation;
};

type ImportState = {
  uid?: string;
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  date?: string;
};

export const useGuestDiaryImport = (uid?: string, enabled = false) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ImportState>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uid || !enabled) return;
    let active = true;
    setState({ uid, status: "loading" });
    void importGuestDiary(uid, () => auth.currentUser?.uid)
      .then(async (date) => {
        if (date) {
          await queryClient.invalidateQueries({
            queryKey: diaryQueryKeys.all(uid),
            refetchType: "all",
          });
        }
        if (active) setState({ uid, status: "ready", date: date ?? undefined });
      })
      .catch((error: unknown) => {
        console.error("Failed to import guest diary", error);
        if (active)
          setState({
            uid,
            status: "error",
            error:
              error instanceof Error ? error.message : "保存に失敗しました",
          });
      });
    return () => {
      active = false;
    };
  }, [uid, enabled, attempt, queryClient]);

  const acknowledge = useCallback(
    () => setState((current) => ({ ...current, date: undefined })),
    [],
  );

  return {
    acknowledge,
    ...(state.uid === uid && enabled ? state : { status: "idle" as const }),
    retry: () => setAttempt((value) => value + 1),
  };
};
