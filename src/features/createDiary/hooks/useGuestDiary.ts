import { useCallback, useEffect, useRef, useState } from "react";

import { mergeDiaryTags } from "@/lib/diaryMetadata";
import { generateDiaryId, generateDiaryImageId } from "@/lib/generateId";
import { DiaryIllustrationClient } from "@/lib/service/diaryIllustrationClient";
import { DiaryMetadataClient } from "@/lib/service/diaryMetadataClient";
import {
  type GuestDiary,
  GuestDiaryClient,
  type GuestDiaryDraft,
  guestDiaryDraftSchema,
  guestDiarySchema,
} from "@/lib/service/guestDiaryClient";

import type { DiaryCreationProgress, DiarySaveMode } from "../types";

export const prepareGuestDiary = async (
  draft: GuestDiaryDraft & { images?: unknown[] },
  mode: DiarySaveMode,
): Promise<GuestDiary> => {
  if (draft.images?.length) throw new Error("ゲストでは画像を追加できません");
  if (!draft.content.trim()) throw new Error("本文を入力してください");
  if (mode !== "standard" && mode !== "illustrated")
    throw new Error("不正な作成方法です");
  const input = guestDiaryDraftSchema.parse(draft);
  const content = input.content.trim();
  const [meta, image] = await Promise.all([
    DiaryMetadataClient.generate(
      content,
      input.tags.map((tag) => tag.name),
      null,
    ),
    mode === "illustrated"
      ? DiaryIllustrationClient.generate({
          content,
          tags: input.tags.map((tag) => tag.name),
          memoryContext: null,
        })
      : undefined,
  ]);
  return guestDiarySchema.parse({
    ...input,
    content,
    tags: mergeDiaryTags(input.tags, meta.tags),
    title: meta.title,
    id: generateDiaryId(),
    imageId: generateDiaryImageId(),
    image,
    createdAt: new Date().toISOString(),
  });
};

export const useGuestDiary = () => {
  const [draft, setDraft] = useState<GuestDiaryDraft>(() => ({
    date: new Date().toISOString(),
    content: "",
    tags: [],
  }));
  const [diary, setDiary] = useState<GuestDiary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DiaryCreationProgress | null>(null);
  const [saveMode, setSaveMode] = useState<DiarySaveMode>("standard");
  const [reload, setReload] = useState(0);
  const pending = useRef(false);
  const prepared = useRef<GuestDiary | null>(null);
  const mounted = useRef(false);
  const latest = useRef(draft);
  latest.current = draft;

  useEffect(() => {
    let active = true;
    mounted.current = true;
    setLoadError(null);
    setLoaded(false);
    void GuestDiaryClient.load()
      .then((record) => {
        if (!active) return;
        if (record) setDraft(record.draft);
        setRestoredDraft(
          Boolean(!record?.diary && record?.draft.content.trim()),
        );
        setDiary(record?.diary ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setLoadError(
            "このブラウザの日記を読み込めませんでした。保存データを保持しています。",
          );
        }
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [reload]);

  const flushDraft = useCallback(async () => {
    if (!loaded || diary || pending.current || prepared.current) return;
    try {
      await GuestDiaryClient.saveDraft(latest.current, () => mounted.current);
      setDraftError(null);
    } catch (error) {
      setDraftError(
        "このブラウザに下書きを保存できませんでした。入力内容を保持しています。",
      );
      throw error;
    }
  }, [loaded, diary]);

  useEffect(() => {
    if (!loaded || diary || progress || prepared.current) return;
    const timer = setTimeout(() => {
      void flushDraft().catch(() => undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [draft, diary, loaded, progress, flushDraft]);

  useEffect(() => {
    if (diary || !draft.content.trim()) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [diary, draft.content]);

  const create = async () => {
    if (pending.current || diary || !loaded || !draft.content.trim()) return;
    pending.current = true;
    setCreateError(null);
    const mode = saveMode;
    const generationStatus = prepared.current ? "complete" : "active";
    setProgress({
      saveMode: mode,
      metadata: generationStatus,
      illustration: mode === "illustrated" ? generationStatus : null,
      persistence: prepared.current ? "active" : "pending",
    });
    try {
      await GuestDiaryClient.exclusive(async () => {
        const existing = await GuestDiaryClient.load();
        if (existing?.diary) {
          prepared.current = null;
          setDiary(existing.diary);
          return;
        }
        if (!prepared.current) {
          await GuestDiaryClient.write({ version: 1, draft });
          // Keep the generated result in memory if the IndexedDB commit fails.
          prepared.current = await prepareGuestDiary(draft, mode);
          setProgress({
            saveMode: mode,
            metadata: "complete",
            illustration: mode === "illustrated" ? "complete" : null,
            persistence: "active",
          });
        }
        const result = prepared.current;
        await GuestDiaryClient.write({ version: 1, draft, diary: result });
        prepared.current = null;
        setDiary(result);
      });
    } catch (cause) {
      console.error("Failed to create guest diary", cause);
      setCreateError(
        prepared.current
          ? "このブラウザに日記を保存できませんでした。同じ結果で保存を再試行できます。"
          : "日記を保存できませんでした。入力内容を保持しています。",
      );
    } finally {
      pending.current = false;
      setProgress(null);
    }
  };

  return {
    draft,
    setDraft,
    diary,
    loaded,
    restoredDraft,
    loadError,
    draftError,
    createError,
    progress,
    saveMode,
    setSaveMode,
    hasPreparedResult: Boolean(prepared.current),
    create,
    flushDraft,
    retryLoad: () => setReload((value) => value + 1),
  };
};
