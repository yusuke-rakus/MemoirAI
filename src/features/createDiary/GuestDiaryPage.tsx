import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useBlocker,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { toast } from "sonner";

import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { DiaryMarkdown } from "@/components/shared/diary/DiaryMarkdown";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PATHS } from "@/constants/path";
import { DefaultTagColor } from "@/constants/tagColors";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useShortcut } from "@/hooks/useShortcut";
import type { AppShellOutletContext } from "@/layout/AppShellLayout";
import { MainLayout } from "@/layout/MainLayout";
import { mergeDiaryTags } from "@/lib/diaryMetadata";
import type { DiaryCard } from "@/types/diaryDraft";

import { DiaryCreationProgressDialog } from "./components/DiaryCreationProgressDialog";
import { DiarySaveButton } from "./components/DiarySaveButton";
import { DiaryCardEditor } from "./components/editor/DiaryCardEditor";
import { useGuestDiary } from "./hooks/useGuestDiary";

const GuestDiaryView = () => {
  const guest = useGuestDiary();
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>();
  const allowNavigation = useRef(false);
  const busy = guest.progress !== null;
  const frozen = busy || guest.hasPreparedResult;
  const blocker = useBlocker(
    () =>
      !allowNavigation.current &&
      !guest.diary &&
      Boolean(guest.draft.content.trim()),
  );
  useDocumentTitle("日記を体験する");
  useShortcut("save", () => void guest.create(), {
    enabled:
      guest.loaded && !busy && !guest.diary && blocker.state !== "blocked",
  });

  useEffect(() => {
    if (!guest.diary?.image) return;
    const url = URL.createObjectURL(guest.diary.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [guest.diary?.image]);

  const goToLogin = async () => {
    if (frozen) return;
    try {
      await guest.flushDraft();
      allowNavigation.current = true;
      navigate(PATHS.login.path);
    } catch {
      toast.error("下書きを保存できませんでした。入力内容を保持しています。");
    }
  };

  const leaveWithDraft = async () => {
    if (frozen) return;
    try {
      await guest.flushDraft();
      allowNavigation.current = true;
      blocker.proceed?.();
    } catch {
      toast.error("下書きを保存できませんでした。再試行してください。");
    }
  };

  const addTag = () => {
    if (frozen || !tagInput.trim()) return;
    guest.setDraft((draft) => ({
      ...draft,
      tags: mergeDiaryTags(draft.tags, [
        { name: tagInput, color: DefaultTagColor },
      ]),
    }));
    setTagInput("");
  };

  const card: DiaryCard = {
    id: "guest",
    title: "",
    body: guest.draft.content,
    date: new Date(guest.draft.date),
    tags: guest.draft.tags,
    images: [],
    isCollapsed: false,
    isRemoving: false,
  };

  return (
    <MainLayout
      sidebarComponent={null}
      headerOffsetClassName="mt-14"
      headerComponent={
        <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
          <span className="text-xl font-bold">MemoirAI</span>
          <Button
            variant="outline"
            disabled={frozen || guest.loadError}
            onClick={() => void goToLogin()}
          >
            ログイン
          </Button>
        </header>
      }
    >
      <div className="space-y-6 px-2 py-8 sm:px-6">
        <div className="space-y-2">
          <h1 className="!text-2xl leading-tight font-bold sm:!text-3xl">
            ログインせずに、日記を体験
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            日記を1件作成できます。写真の追加はできませんが、本文から絵日記を生成できます。
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            日記はこのブラウザ内に一時保存されます。同じブラウザでログインすると、アカウントに登録されます。ブラウザのデータを削除すると日記も失われます。
          </p>
        </div>

        {guest.loadError ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">
              {guest.error}
            </p>
            <Button onClick={guest.retryLoad}>読み込みを再試行</Button>
          </div>
        ) : !guest.loaded ? (
          <LoadingScreen variant="page" />
        ) : guest.diary ? (
          <article className="space-y-5 rounded-lg border bg-card p-5 sm:p-8">
            <p className="text-sm text-muted-foreground">
              {format(new Date(guest.diary.date), "yyyy年M月d日")}
            </p>
            <h2 className="text-xl font-semibold">{guest.diary.title}</h2>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="日記の本文から生成したイラスト"
                className="mx-auto aspect-[4/3] w-full max-w-lg rounded-lg object-contain"
              />
            )}
            <DiaryMarkdown>{guest.diary.content}</DiaryMarkdown>
            <div className="flex flex-wrap gap-2">
              {guest.diary.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="space-y-3 border-t pt-5">
              <p className="text-sm text-muted-foreground">
                ログインすると、この日記と生成画像をアカウントに保存できます。編集や次の日記の作成はログイン後に行えます。
              </p>
              <Button onClick={() => void goToLogin()}>
                Googleでログインして保存
              </Button>
            </div>
          </article>
        ) : (
          <>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="guest-diary-date">日記の日付</Label>
              <Input
                id="guest-diary-date"
                type="date"
                value={format(card.date, "yyyy-MM-dd")}
                disabled={frozen}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
                  const date = new Date(`${value}T00:00:00`);
                  if (!Number.isNaN(date.getTime()))
                    guest.setDraft((draft) => ({
                      ...draft,
                      date: date.toISOString(),
                    }));
                }}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Label htmlFor="diary-body-guest">
                    今日の出来事を書き留めよう
                  </Label>
                </CardTitle>
              </CardHeader>
              <DiaryCardEditor
                card={card}
                dateKey={guest.draft.date}
                disabled={frozen}
                allowImageUpload={false}
                markdownEditorEnabled={false}
                placeholder="今日はどんな一日でしたか？"
                tagInput={tagInput}
                onAddImages={() => ({
                  addedCount: 0,
                  unsupportedCount: 0,
                  limitExceeded: false,
                })}
                onRemoveImage={() => undefined}
                onAddTag={addTag}
                onRemoveTag={(_, index) =>
                  guest.setDraft((draft) => ({
                    ...draft,
                    tags: draft.tags.filter((_, i) => i !== index),
                  }))
                }
                onTagInputChange={(_, value) => setTagInput(value)}
                onTagInputKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    addTag();
                  }
                }}
                onUpdateBody={(_, content) =>
                  guest.setDraft((draft) => ({ ...draft, content }))
                }
              />
            </Card>
            {guest.error && (
              <p role="alert" className="text-sm text-destructive">
                {guest.error}
              </p>
            )}
            <div className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                日記を作成すると、
                <a
                  href={`${PATHS.legal.path}#terms`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  利用規約
                </a>
                に同意したものとみなします。
              </p>
              <p className="text-xs leading-6 text-muted-foreground">
                日本国内在住の18歳以上の方が対象です。本文・タグはタイトルやタグ、選択した場合のイラスト生成のためGeminiへ送信されます。
                <a
                  href={`${PATHS.legal.path}#privacy`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  プライバシーポリシー
                </a>
                ・
                <a
                  href={`${PATHS.legal.path}#ai-data-use`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  AIデータ利用方針
                </a>
                をご確認ください。
              </p>
              <div className="flex">
                <DiarySaveButton
                  saveMode={guest.saveMode}
                  createPhase={
                    !busy
                      ? "idle"
                      : guest.progress?.persistence === "active"
                        ? "saving"
                        : "generating"
                  }
                  saveModeLocked={guest.hasPreparedResult}
                  idleLabel={
                    guest.hasPreparedResult
                      ? "端末への保存を再試行"
                      : guest.saveMode === "illustrated"
                        ? "絵日記を作成"
                        : "日記を作成"
                  }
                  onSaveModeChange={guest.setSaveMode}
                  onSave={() => void guest.create()}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <DiaryCreationProgressDialog progress={guest.progress} />
      <Dialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>作成中の日記があります</DialogTitle>
            <DialogDescription>
              {frozen
                ? "作成結果の保存を完了してから移動してください。"
                : "入力内容をこのブラウザに残してから移動できます。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => blocker.reset?.()}>
              作成を続ける
            </Button>
            <Button disabled={frozen} onClick={() => void leaveWithDraft()}>
              下書きを残して移動
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export const GuestDiaryPage = () => {
  const { user } = useOutletContext<AppShellOutletContext>();
  return user ? (
    <Navigate to={PATHS.newDiary.path} replace />
  ) : (
    <GuestDiaryView />
  );
};
