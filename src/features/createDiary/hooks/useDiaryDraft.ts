import { useLocalUser } from "@/contexts/LocalUserContext";
import { DiaryDraftClient } from "@/lib/service/diaryDraftClient";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { toast } from "sonner";
import { useDiaryCard } from "./useDiaryCard";

export type DraftStatus =
  "idle" | "restoring" | "dirty" | "saving" | "saved" | "error";

export const useDiaryDraft = (date: Date) => {
  const { localUser } = useLocalUser();
  const { cards, restore, reset } = useDiaryCard();
  const [status, setStatus] = useState<DraftStatus>("restoring");
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const allowNavigationRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const dateKey = format(date, "yyyy-MM-dd");
  const hasContent = useMemo(() => DiaryDraftClient.hasContent(cards), [cards]);

  useEffect(() => {
    if (!localUser.uid) return;
    let active = true;
    setStatus("restoring");
    setIsReady(false);

    void DiaryDraftClient.load(localUser.uid, dateKey)
      .then((draft) => {
        if (!active) return;
        if (draft && DiaryDraftClient.hasContent(draft)) {
          setHasRestorableDraft(true);
          return;
        }
        setStatus("idle");
        setIsReady(true);
      })
      .catch((error) => {
        console.error("Failed to load diary draft", error);
        if (!active) return;
        setStatus("error");
        setIsReady(true);
        toast.error("下書きの読み込みに失敗しました");
      });

    return () => {
      active = false;
    };
  }, [dateKey, localUser.uid]);

  const saveDraft = useCallback(async () => {
    if (!localUser.uid || !hasContent) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    setStatus("saving");
    const savePromise = DiaryDraftClient.save(localUser.uid, dateKey, cards);
    savePromiseRef.current = savePromise;
    try {
      await savePromise;
      setStatus("saved");
    } catch (error) {
      console.error("Failed to save diary draft", error);
      setStatus("error");
      toast.error("下書きの保存に失敗しました");
      throw error;
    } finally {
      if (savePromiseRef.current === savePromise) {
        savePromiseRef.current = null;
      }
    }
  }, [cards, dateKey, hasContent, localUser.uid]);

  useEffect(() => {
    if (!localUser.uid || !isReady || allowNavigation) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (!hasContent) {
      setStatus("idle");
      return;
    }

    setStatus("dirty");
    saveTimerRef.current = setTimeout(() => {
      void saveDraft().catch(() => undefined);
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [allowNavigation, hasContent, isReady, localUser.uid, saveDraft]);

  useEffect(() => {
    if (!hasContent || allowNavigation) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [allowNavigation, hasContent]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !allowNavigationRef.current &&
      hasContent &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  const restoreDraft = useCallback(async () => {
    if (!localUser.uid) return;
    try {
      const draft = await DiaryDraftClient.load(localUser.uid, dateKey);
      if (draft) restore(draft);
      setHasRestorableDraft(false);
      setStatus("saved");
      setIsReady(true);
    } catch (error) {
      console.error("Failed to restore diary draft", error);
      toast.error("下書きの復元に失敗しました");
      setStatus("error");
      setIsReady(true);
    }
  }, [dateKey, localUser.uid, restore]);

  const discardDraft = useCallback(async () => {
    if (!localUser.uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await savePromiseRef.current?.catch(() => undefined);
    await DiaryDraftClient.clear(localUser.uid, dateKey).catch((error) => {
      console.error("Failed to clear diary draft", error);
    });
    reset(date);
    setHasRestorableDraft(false);
    setStatus("idle");
    setIsReady(true);
  }, [date, dateKey, localUser.uid, reset]);

  const completeDraft = useCallback(async () => {
    if (!localUser.uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    allowNavigationRef.current = true;
    setAllowNavigation(true);
    await savePromiseRef.current?.catch(() => undefined);
    await DiaryDraftClient.clear(localUser.uid, dateKey, cards);
  }, [cards, dateKey, localUser.uid]);

  const leaveWithDraft = useCallback(async () => {
    await saveDraft().catch(() => undefined);
    allowNavigationRef.current = true;
    setAllowNavigation(true);
    blocker.proceed?.();
  }, [blocker, saveDraft]);

  const discardAndLeave = useCallback(async () => {
    await discardDraft();
    allowNavigationRef.current = true;
    setAllowNavigation(true);
    blocker.proceed?.();
  }, [blocker, discardDraft]);

  return {
    status,
    hasContent,
    hasRestorableDraft,
    isNavigationBlocked: blocker.state === "blocked",
    restoreDraft,
    discardDraft,
    completeDraft,
    leaveWithDraft,
    discardAndLeave,
    stay: blocker.reset,
  };
};
