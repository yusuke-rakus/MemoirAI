import { format } from "date-fns";
import { CircleCheck } from "lucide-react";
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
import { FadeContent } from "@/components/ui/fade-content";
import { Label } from "@/components/ui/label";
import { PATHS } from "@/constants/path";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { useShortcut } from "@/hooks/useShortcut";
import type { AppShellOutletContext } from "@/layout/AppShellLayout";
import { MainLayout } from "@/layout/MainLayout";
import type { DiaryCard } from "@/types/diaryDraft";

import { DiaryCreationProgressDialog } from "./components/DiaryCreationProgressDialog";
import { DiaryDatePicker } from "./components/DiaryDatePicker";
import { DiarySaveButton } from "./components/DiarySaveButton";
import { DiaryCardEditor } from "./components/editor/DiaryCardEditor";
import { useDiaryWritingPrompt } from "./hooks/useDiaryWritingPrompt";
import { useGuestDiary } from "./hooks/useGuestDiary";

const GuestDiaryView = () => {
  const guest = useGuestDiary();
  const writingPrompt = useDiaryWritingPrompt(guest.loaded && !guest.diary);
  const { login, isLoggingIn } = useGoogleLogin();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [bodyInvalid, setBodyInvalid] = useState(false);
  const allowNavigation = useRef(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const saveRequested = useRef(false);
  const busy = guest.progress !== null;
  const frozen = busy || guest.hasPreparedResult || isLoggingIn;
  const saveError = guest.createError ?? guest.draftError;
  const saveLabel = guest.saveMode === "illustrated" ? "絵日記" : "日記";
  const blocker = useBlocker(
    () =>
      !allowNavigation.current &&
      !guest.diary &&
      Boolean(guest.draft.content.trim()),
  );
  const handleSave = () => {
    if (busy || isLoggingIn) return;
    if (!guest.draft.content.trim()) {
      setBodyInvalid(true);
      document.getElementById("diary-body-guest")?.focus();
      return;
    }
    saveRequested.current = true;
    void guest.create();
  };

  useShortcut("save", handleSave, {
    enabled:
      guest.loaded &&
      !busy &&
      !isLoggingIn &&
      !guest.diary &&
      blocker.state !== "blocked",
  });

  useEffect(() => {
    if (!guest.diary?.image) return;
    const url = URL.createObjectURL(guest.diary.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [guest.diary?.image]);

  useEffect(() => {
    if (guest.diary && saveRequested.current) {
      resultHeading.current?.focus();
      saveRequested.current = false;
    }
  }, [guest.diary]);

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
      title={guest.diary ? "日記を保存しました" : "日記を書く"}
      sidebarComponent={null}
      headerOffsetClassName="mt-14"
      headerComponent={
        <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
          <span className="text-xl font-bold">MemoirAI</span>
          <Button
            variant="outline"
            disabled={frozen || Boolean(guest.loadError)}
            onClick={() => void goToLogin()}
          >
            ログイン
          </Button>
        </header>
      }
    >
      <div className="mx-auto max-w-2xl space-y-3 px-2 pt-4 pb-8 sm:px-0 sm:pt-8">
        {guest.diary ? (
          <h1
            ref={resultHeading}
            tabIndex={-1}
            className="flex items-center gap-2 !text-xl leading-tight font-semibold sm:!text-2xl"
          >
            <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
            このブラウザに日記を保存しました
          </h1>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-1">
            <h1 className="!text-2xl leading-tight font-semibold">
              日記を書く
            </h1>
            {guest.loaded && (
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
            )}
          </div>
        )}

        {guest.loadError ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">
              {guest.loadError}
            </p>
            <Button onClick={guest.retryLoad}>読み込みを再試行</Button>
          </div>
        ) : !guest.loaded ? (
          <LoadingScreen variant="page" />
        ) : guest.diary ? (
          <FadeContent>
            <article className="space-y-5 rounded-lg border bg-card p-5 sm:p-8">
              <p className="text-sm text-muted-foreground">
                {format(new Date(guest.diary.date), "yyyy年M月d日")}
              </p>
              <h2 className="text-xl font-semibold">{guest.diary.title}</h2>
              {previewUrl && (
                <FadeContent>
                  <img
                    src={previewUrl}
                    alt="日記の本文から生成したイラスト"
                    className="mx-auto aspect-[4/3] w-full max-w-lg rounded-lg object-contain"
                  />
                </FadeContent>
              )}
              <DiaryMarkdown>{guest.diary.content}</DiaryMarkdown>
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  ログインすると、アカウントでもこの日記を見返せます。
                </p>
                <Button
                  variant="outline"
                  className="h-11"
                  disabled={frozen}
                  onClick={() => void login()}
                >
                  {isLoggingIn ? "ログイン中…" : "Googleでログインして引き継ぐ"}
                </Button>
              </div>
            </article>
          </FadeContent>
        ) : (
          <>
            <Card className="gap-3 py-4">
              <CardHeader className="px-4 sm:px-5">
                <CardTitle className="text-sm leading-snug font-medium">
                  {writingPrompt ? (
                    <p id="diary-body-guest-prompt">{writingPrompt}</p>
                  ) : (
                    <Label htmlFor="diary-body-guest">本文</Label>
                  )}
                </CardTitle>
              </CardHeader>
              <DiaryCardEditor
                card={card}
                dateKey={guest.draft.date}
                disabled={frozen}
                allowImageUpload={false}
                allowTagEditing={false}
                markdownEditorEnabled={false}
                writingPromptId={
                  writingPrompt ? "diary-body-guest-prompt" : undefined
                }
                error={bodyInvalid ? "本文を一言入力してください。" : undefined}
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
                onUpdateBody={(_, content) => {
                  if (content.trim()) setBodyInvalid(false);
                  guest.setDraft((draft) => ({ ...draft, content }));
                }}
              />
            </Card>
            <div className="space-y-2">
              <DiarySaveButton
                buttonRef={saveButtonRef}
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
                    : guest.createError
                      ? `${saveLabel}の保存を再試行`
                      : `${saveLabel}を端末に保存`
                }
                onSaveModeChange={guest.setSaveMode}
                onSave={handleSave}
              />
              {saveError && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
              {guest.restoredDraft && (
                <p className="text-sm text-muted-foreground">
                  このブラウザの下書きを復元しました
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <DiaryCreationProgressDialog
        progress={guest.progress}
        destination="browser"
        returnFocusRef={saveButtonRef}
      />
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
