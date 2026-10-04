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
import { Label } from "@/components/ui/label";
import { PATHS } from "@/constants/path";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useShortcut } from "@/hooks/useShortcut";
import type { AppShellOutletContext } from "@/layout/AppShellLayout";
import { MainLayout } from "@/layout/MainLayout";
import type { DiaryCard } from "@/types/diaryDraft";

import { DiaryCreationProgressDialog } from "./components/DiaryCreationProgressDialog";
import { DiaryDatePicker } from "./components/DiaryDatePicker";
import { DiarySaveButton } from "./components/DiarySaveButton";
import { DiaryCardEditor } from "./components/editor/DiaryCardEditor";
import { useGuestDiary } from "./hooks/useGuestDiary";

const GuestDiaryView = () => {
  const guest = useGuestDiary();
  const navigate = useNavigate();
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
        <h1 className="!text-2xl leading-tight font-bold sm:!text-3xl">
          あなたの一日を、日記にしてみよう
        </h1>

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
            <div className="space-y-3 border-t pt-5">
              <Button onClick={() => void goToLogin()}>
                Googleでログインして保存
              </Button>
            </div>
          </article>
        ) : (
          <>
            <DiaryDatePicker
              date={card.date}
              disabled={frozen}
              onSelect={(date) =>
                guest.setDraft((draft) => ({
                  ...draft,
                  date: date.toISOString(),
                }))
              }
            />
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
                allowTagEditing={false}
                markdownEditorEnabled={false}
                placeholder="今日はどんな一日でしたか？"
                tagInput=""
                onAddImages={() => ({
                  addedCount: 0,
                  unsupportedCount: 0,
                  limitExceeded: false,
                })}
                onRemoveImage={() => undefined}
                onAddTag={() => undefined}
                onRemoveTag={() => undefined}
                onTagInputChange={() => undefined}
                onTagInputKeyDown={() => undefined}
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
