import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AnimatedContent } from "@/components/ui/animated-content";
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
import { MAX_DIARY_IMAGE_COUNT } from "@/constants/diaryImages";
import { PATHS } from "@/constants/path";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { useShortcut } from "@/hooks/useShortcut";
import { cn } from "@/lib/utils";

import {
  getDiarySaveErrorMessage,
  useCreateDiary,
} from "../hooks/useCreateDiary";
import { useDiaryCard } from "../hooks/useDiaryCard";
import { useDiaryDraft } from "../hooks/useDiaryDraft";
import { useDiaryWritingPrompt } from "../hooks/useDiaryWritingPrompt";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import type { DiarySaveMode } from "../types";
import { DiaryCreationProgressDialog } from "./DiaryCreationProgressDialog";
import { DiaryDatePicker } from "./DiaryDatePicker";
import { DiarySaveButton } from "./DiarySaveButton";
import { DiaryCardEditor } from "./editor/DiaryCardEditor";

export const NewDiaryView = () => {
  const { localUser } = useLocalUser();
  const navigate = useNavigate();
  const { date } = useDiaryDetailStore();
  const dateKey = format(date, "yyyy-MM-dd");
  const writingPrompt = useDiaryWritingPrompt();
  const { createPhase, creationProgress, isCreating, onSave } =
    useCreateDiary();
  const {
    cards,
    tagInputs,
    addCard,
    removeCard,
    updateCardBody,
    addImages,
    removeImage,
    addTag,
    removeTag,
    handleTagInputChange,
    handleTagInputKeyDown,
    reset,
  } = useDiaryCard();
  const {
    status: draftStatus,
    hasRestorableDraft,
    isNavigationBlocked,
    restoreDraft,
    discardDraft,
    completeDraft,
    leaveWithDraft,
    discardAndLeave,
    stay,
  } = useDiaryDraft(date);

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<DiarySaveMode>("standard");
  const [bodyErrors, setBodyErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isActingOnDraft, setIsActingOnDraft] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const restoreButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const savePending = useRef(false);
  const isSaving = isCreating || isFinishing;
  const editorDisabled = isSaving || draftStatus === "restoring";
  useShortcut("save", () => void handleSave(), {
    enabled: !editorDisabled && !hasRestorableDraft && !isNavigationBlocked,
  });

  const changeDate = (nextDate: Date) => {
    const nextDateKey = format(nextDate, "yyyy-MM-dd");
    if (nextDateKey !== dateKey) {
      navigate(`${PATHS.newDiary.path}/${nextDateKey}`);
    }
  };

  useEffect(() => {
    reset(date);
  }, [date, reset]);

  useEffect(() => {
    const firstInvalidId = Object.keys(bodyErrors)[0];
    if (firstInvalidId) {
      document.getElementById(`diary-body-${firstInvalidId}`)?.focus();
    }
  }, [bodyErrors]);

  const handleSave = async () => {
    if (savePending.current || editorDisabled) return;
    setSaveError(null);
    const invalidCard = cards.find(
      (card) =>
        !card.body.trim() && (card.tags.length > 0 || card.images.length > 0),
    );
    const hasBody = cards.some((card) => card.body.trim());
    if (invalidCard || !hasBody) {
      setBodyErrors(
        Object.fromEntries(
          cards
            .filter(
              (card) =>
                !card.body.trim() &&
                (!hasBody || card.tags.length > 0 || card.images.length > 0),
            )
            .map((card) => [card.id, "本文を入力してください。"]),
        ),
      );
      return;
    }
    setBodyErrors({});

    if (saveMode === "illustrated") {
      const fullImageCard = cards.find(
        (card) =>
          card.body.trim() && card.images.length >= MAX_DIARY_IMAGE_COUNT,
      );

      if (fullImageCard) {
        setSaveError("イラストを追加するには、写真を1枚削除してください。");
        return;
      }
    }

    savePending.current = true;
    try {
      try {
        await onSave(saveMode);
      } catch (error) {
        setSaveError(getDiarySaveErrorMessage(error));
        return;
      }

      setIsFinishing(true);
      try {
        await completeDraft();
      } catch (error) {
        console.error("Failed to clear draft after saving diary", error);
        toast.error("日記は保存しましたが、下書きを削除できませんでした。");
      }
      navigate(`${PATHS.diaries.path}/${dateKey}`, {
        state: { diarySaved: true },
      });
    } finally {
      savePending.current = false;
      setIsFinishing(false);
    }
  };

  const runDraftAction = async (action: () => Promise<void>) => {
    if (isActingOnDraft) return;
    setIsActingOnDraft(true);
    try {
      await action();
    } finally {
      setIsActingOnDraft(false);
    }
  };

  const hasDraggedFiles = (event: DragEvent<HTMLElement>) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const showAddImagesResult = (result: ReturnType<typeof addImages>) => {
    if (result.unsupportedCount > 0) {
      toast.error("JPEG、PNG、WebP、HEIC/HEIFの画像のみ追加できます");
    }

    if (result.limitExceeded) {
      toast.error("画像は1つの日記につき2枚まで追加できます");
    }
  };

  const handleCardDragEnter = (
    event: DragEvent<HTMLElement>,
    cardId: string,
  ) => {
    if (editorDisabled || !hasDraggedFiles(event)) return;

    event.preventDefault();
    setDraggingCardId(cardId);
  };

  const handleCardDragOver = (
    event: DragEvent<HTMLElement>,
    cardId: string,
  ) => {
    if (!hasDraggedFiles(event)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = editorDisabled ? "none" : "copy";
    if (!editorDisabled) setDraggingCardId(cardId);
  };

  const handleCardDragLeave = (event: DragEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;

    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    setDraggingCardId(null);
  };

  const handleCardDrop = (event: DragEvent<HTMLElement>, cardId: string) => {
    if (!hasDraggedFiles(event)) return;

    event.preventDefault();
    setDraggingCardId(null);

    if (editorDisabled) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    showAddImagesResult(addImages(cardId, files));
  };

  return (
    <div className="mx-auto max-w-2xl px-2 pt-4 pb-8 sm:px-0 sm:pt-8">
      <div ref={editorRef} className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-1">
          <h1 className="!text-2xl font-semibold">日記を書く</h1>
          <DiaryDatePicker
            date={date}
            disabled={editorDisabled}
            onSelect={changeDate}
          />
        </header>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {cards.map((card, index) => (
              <AnimatedContent key={card.id}>
                <Card
                  className={cn(
                    "relative gap-3 py-4",
                    draggingCardId === card.id &&
                      "bg-accent/30 ring-2 ring-primary/60",
                  )}
                  onDragEnter={(event) => handleCardDragEnter(event, card.id)}
                  onDragOver={(event) => handleCardDragOver(event, card.id)}
                  onDragLeave={handleCardDragLeave}
                  onDrop={(event) => handleCardDrop(event, card.id)}
                >
                  <CardHeader className="flex items-center justify-between gap-2 px-4 sm:px-5">
                    <CardTitle className="min-w-0 text-sm leading-snug font-medium">
                      {index === 0 && writingPrompt ? (
                        <p id={`diary-body-${card.id}-prompt`}>
                          {writingPrompt}
                        </p>
                      ) : (
                        <Label htmlFor={`diary-body-${card.id}`}>
                          {cards.length > 1 ? `本文 ${index + 1}` : "本文"}
                        </Label>
                      )}
                    </CardTitle>
                    {cards.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={editorDisabled}
                        onClick={() => removeCard(card.id)}
                        aria-label={`セクション${index + 1}を削除`}
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X aria-hidden="true" />
                      </Button>
                    )}
                  </CardHeader>

                  <DiaryCardEditor
                    card={card}
                    dateKey={dateKey}
                    disabled={editorDisabled}
                    markdownEditorEnabled={localUser.markdownEditorEnabled}
                    writingPromptId={
                      index === 0 && writingPrompt
                        ? `diary-body-${card.id}-prompt`
                        : undefined
                    }
                    error={card.body.trim() ? undefined : bodyErrors[card.id]}
                    tagInput={tagInputs[card.id] || ""}
                    onAddImages={(cardId, files) => {
                      const result = addImages(cardId, files);
                      showAddImagesResult(result);
                      return result;
                    }}
                    onAddTag={addTag}
                    onRemoveImage={removeImage}
                    onRemoveTag={removeTag}
                    onTagInputChange={handleTagInputChange}
                    onTagInputKeyDown={handleTagInputKeyDown}
                    onUpdateBody={updateCardBody}
                  />
                </Card>
              </AnimatedContent>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <DiarySaveButton
            buttonRef={saveButtonRef}
            disabled={editorDisabled}
            saveMode={saveMode}
            createPhase={isFinishing ? "saving" : createPhase}
            idleLabel={saveError ? "保存を再試行" : undefined}
            onSaveModeChange={(mode) => {
              setSaveMode(mode);
              setSaveError(null);
            }}
            onSave={() => void handleSave()}
          />
          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              <span className="block">{saveError}</span>
              入力内容は保持されています。
            </p>
          )}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {draftStatus === "saved" && "下書きをこのブラウザに保存しました。"}
            {draftStatus === "error" &&
              "下書きの保存状態を確認できませんでした。"}
          </p>
        </div>

        <div className="border-t pt-2">
          <Button
            type="button"
            onClick={addCard}
            disabled={editorDisabled}
            variant="ghost"
            className="h-10 px-2 text-muted-foreground"
          >
            <Plus aria-hidden="true" />
            セクションを追加
          </Button>
        </div>
      </div>

      <Dialog open={hasRestorableDraft}>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            restoreButtonRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            editorRef.current?.querySelector("textarea")?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>下書きから続けますか？</DialogTitle>
            <DialogDescription>
              {format(date, "M月d日")}
              の本文・タグ・写真がこのブラウザに残っています。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isActingOnDraft}
              className="flex-1 sm:flex-none"
              onClick={() => void runDraftAction(discardDraft)}
            >
              下書きを破棄
            </Button>
            <Button
              ref={restoreButtonRef}
              type="button"
              disabled={isActingOnDraft}
              className="flex-1 sm:flex-none"
              onClick={() => void runDraftAction(restoreDraft)}
            >
              下書きから続ける
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNavigationBlocked && !isSaving}
        onOpenChange={(open) => {
          if (!open && !isActingOnDraft) stay?.();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => {
            if (isActingOnDraft) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>作成中の日記があります</DialogTitle>
            <DialogDescription>
              入力内容をこのブラウザに下書きとして残してから移動できます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isActingOnDraft}
              onClick={stay}
            >
              書き続ける
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isActingOnDraft}
              className="text-destructive hover:text-destructive"
              onClick={() => void runDraftAction(discardAndLeave)}
            >
              破棄して移動
            </Button>
            <Button
              type="button"
              disabled={isActingOnDraft}
              onClick={() => void runDraftAction(leaveWithDraft)}
            >
              下書きを残して移動
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiaryCreationProgressDialog
        progress={creationProgress}
        destination="account"
        returnFocusRef={saveButtonRef}
      />
    </div>
  );
};
