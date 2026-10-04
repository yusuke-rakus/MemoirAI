import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
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
    setLoadError(false);
    setLoaded(false);
    void GuestDiaryClient.load()
      .then((record) => {
        if (!active) return;
        if (record) setDraft(record.draft);
        setDiary(record?.diary ?? null);
        setLoaded(true);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setError(
            "端末の日記を読み込めませんでした。保存データを保持しています。再試行してください。",
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
    await GuestDiaryClient.saveDraft(latest.current, () => mounted.current);
  }, [loaded, diary]);

  useEffect(() => {
    if (!loaded || diary || progress || prepared.current) return;
    const timer = setTimeout(() => {
      void flushDraft().catch(() =>
        setError(
          "下書きを端末に保存できませんでした。通信やブラウザの設定を確認してください。",
        ),
      );
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
    if (pending.current || diary || !loaded) return;
    if (!draft.content.trim()) {
      setError("本文を入力してください");
      return;
    }
    pending.current = true;
    setError(null);
    const mode = saveMode;
    setProgress({
      saveMode: mode,
      metadata: "active",
      illustration: mode === "illustrated" ? "active" : null,
      persistence: "pending",
    });
    try {
      await GuestDiaryClient.exclusive(async () => {
        const existing = await GuestDiaryClient.load();
        if (existing?.diary) {
          prepared.current = null;
          setDiary(existing.diary);
          return;
        }
        if (!prepared.current)
          await GuestDiaryClient.write({ version: 1, draft });
        // Keep the generated result in memory if the IndexedDB commit fails.
        const result =
          prepared.current ?? (await prepareGuestDiary(draft, mode));
        prepared.current = result;
        setProgress({
          saveMode: mode,
          metadata: "complete",
          illustration: mode === "illustrated" ? "complete" : null,
          persistence: "active",
        });
        await GuestDiaryClient.write({ version: 1, draft, diary: result });
        prepared.current = null;
        setDiary(result);
      });
      toast.success(
        "日記を作成しました。ログインするとアカウントに保存できます。",
      );
    } catch (cause) {
      console.error("Failed to create guest diary", cause);
      setError(
        prepared.current
          ? "作成結果を端末に保存できませんでした。同じ結果で再試行できます。"
          : "日記を作成できませんでした。再試行するか、通常保存に切り替えてください。",
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
    error,
    loadError,
    progress,
    saveMode,
    setSaveMode,
    hasPreparedResult: Boolean(prepared.current),
    create,
    flushDraft,
    retryLoad: () => setReload((value) => value + 1),
  };
};
