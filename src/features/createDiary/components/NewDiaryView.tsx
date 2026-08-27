import { useRotatingText } from "@/components/shared/common/useRotatingText";
import { DiaryMarkdownEditor } from "@/components/shared/diary/DiaryMarkdownEditor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { MAX_DIARY_IMAGE_COUNT } from "@/constants/diaryImages";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { useEffect, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { useDiaryCard } from "../hooks/useDiaryCard";
import { useDiaryDraft } from "../hooks/useDiaryDraft";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { usePickMessages } from "../hooks/usePickMessages";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import type { DiarySaveMode } from "../types";
import { DiaryCreationProgressDialog } from "./DiaryCreationProgressDialog";
import { DiaryImagePicker } from "./DiaryImagePicker";
import { DiarySaveButton } from "./DiarySaveButton";

export const NewDiaryView = () => {
  const navigate = useNavigate();
  const { date, setDate } = useDiaryDetailStore();
  useFetchDiary();
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
    hasRestorableDraft,
    isNavigationBlocked,
    restoreDraft,
    discardDraft,
    completeDraft,
    leaveWithDraft,
    discardAndLeave,
    stay,
  } = useDiaryDraft(date);

  const { pickRandomMessages } = usePickMessages();
  const placeholderText = useRotatingText(pickRandomMessages);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<DiarySaveMode>("standard");

  const customSetDate = (date: Date) => {
    setDate(date);
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`${PATHS.newDiary.path}/${dateString}`);
  };

  useEffect(() => {
    reset(date);
    setSaveMode("standard");
  }, [date, reset]);

  const handleSave = async () => {
    const invalidCard = cards.find(
      (card) =>
        !card.body.trim() && (card.tags.length > 0 || card.images.length > 0),
    );
    const hasBody = cards.some((card) => card.body.trim());
    if (invalidCard || !hasBody) {
      toast.error("本文を入力してください");
      document
        .getElementById(`diary-body-${invalidCard?.id ?? cards[0]?.id}`)
        ?.focus();
      return;
    }

    if (saveMode === "illustrated") {
      const fullImageCard = cards.find(
        (card) =>
          card.body.trim() && card.images.length >= MAX_DIARY_IMAGE_COUNT,
      );

      if (fullImageCard) {
        toast.error("生成画像を追加するには画像を1枚削除してください");
        document.getElementById(`diary-body-${fullImageCard.id}`)?.focus();
        return;
      }
    }

    try {
      await onSave(saveMode);
    } catch {
      return;
    }
    await completeDraft();
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`${PATHS.diaries.path}/${dateString}`);
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
    if (!hasDraggedFiles(event)) return;

    event.preventDefault();
    setDraggingCardId(cardId);
  };

  const handleCardDragOver = (
    event: DragEvent<HTMLElement>,
    cardId: string,
  ) => {
    if (!hasDraggedFiles(event)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = isCreating ? "none" : "copy";
    setDraggingCardId(cardId);
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

    if (isCreating) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    showAddImagesResult(addImages(cardId, files));
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-32 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-muted-foreground">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 gap-3 px-3 text-base font-medium tracking-tight text-muted-foreground hover:text-foreground sm:text-lg"
                  aria-label="日付を変更"
                >
                  <CalendarIcon className="h-5 w-5" />
                  {format(date, "M月d日")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit max-w-[calc(100vw-1rem)] p-0"
                align="start"
                sideOffset={8}
                collisionPadding={8}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={customSetDate}
                  captionLayout="dropdown"
                  required
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <DiarySaveButton
              saveMode={saveMode}
              createPhase={createPhase}
              onSaveModeChange={setSaveMode}
              onSave={() => void handleSave()}
            />
          </div>
        </div>

        <div className="space-y-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "border-none bg-card/50 shadow-sm transition-all duration-300 hover:bg-card/80",
                "group relative overflow-visible backdrop-blur-sm",
                draggingCardId === card.id &&
                  "bg-accent/30 ring-2 ring-primary/60",
              )}
              onDragEnter={(event) => handleCardDragEnter(event, card.id)}
              onDragOver={(event) => handleCardDragOver(event, card.id)}
              onDragLeave={handleCardDragLeave}
              onDrop={(event) => handleCardDrop(event, card.id)}
            >
              {/* Card Remove Button (visible on hover or if multiple) */}
              {cards.length > 1 && (
                <div className="absolute -top-2 -right-2 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCard(card.id)}
                    aria-label={`セクション${cards.indexOf(card) + 1}を削除`}
                    className="h-8 w-8 rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">
                  <Label htmlFor={`diary-body-${card.id}`}>
                    今日の出来事を書き留めよう ✨
                  </Label>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <DiaryMarkdownEditor
                  content={card.body}
                  disabled={isCreating}
                  resetKey={`${format(date, "yyyy-MM-dd")}:${card.id}`}
                  previewClassName="max-h-[500px] min-h-[300px] border-none shadow"
                >
                  <Textarea
                    id={`diary-body-${card.id}`}
                    placeholder={placeholderText}
                    value={card.body}
                    disabled={isCreating}
                    onChange={(e) => updateCardBody(card.id, e.target.value)}
                    className="max-h-[500px] min-h-[300px] resize-none overflow-y-auto border-none leading-relaxed shadow placeholder:text-muted-foreground/30 focus-visible:ring-0"
                  />
                </DiaryMarkdownEditor>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

                {/* Tags Section */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <DiaryImagePicker
                    cardId={card.id}
                    images={card.images}
                    disabled={isCreating}
                    onAddImages={addImages}
                  />

                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center gap-1.5 rounded-md bg-secondary/50 px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                      >
                        {tag.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTag(card.id, tagIndex)}
                          aria-label={`${tag.name}タグを削除`}
                          className="size-4 rounded-full hover:bg-transparent hover:text-destructive [&_svg]:size-3"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    ))}
                  </div>

                  <div className="relative flex min-w-[200px] items-center">
                    <Input
                      placeholder="タグを追加"
                      value={tagInputs[card.id] || ""}
                      onChange={(e) =>
                        handleTagInputChange(card.id, e.target.value)
                      }
                      onKeyDown={(e) => handleTagInputKeyDown(e, card.id)}
                      className="h-8 border-none bg-transparent text-sm shadow placeholder:text-muted-foreground/40 focus-visible:ring-0"
                    />
                    {tagInputs[card.id] && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="ml-2 h-6 w-6"
                        onClick={() => addTag(card.id)}
                        aria-label="タグを追加"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {card.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {card.images.map((image) => (
                      <div
                        key={image.id}
                        className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted"
                      >
                        <img
                          src={image.previewUrl}
                          alt={`${image.file.name} のプレビュー`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={isCreating}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-sm"
                          onClick={() => removeImage(card.id, image.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Another Section */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={addCard}
            variant="outline"
            className="group h-auto rounded-full border-dashed border-border px-6 py-6 transition-all hover:border-primary/50 hover:bg-accent/5"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            セクションを追加
          </Button>
        </div>
      </div>

      <Dialog open={hasRestorableDraft}>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>保存された下書きがあります</DialogTitle>
            <DialogDescription>
              この端末に残っている本文・タグ・画像を復元できます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => void discardDraft()}
            >
              破棄する
            </Button>
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={() => void restoreDraft()}
            >
              復元する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNavigationBlocked}
        onOpenChange={(open) => {
          if (!open) stay?.();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>作成中の日記があります</DialogTitle>
            <DialogDescription>
              移動する前に、入力内容を下書きとして残すか、破棄してください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void discardAndLeave()}
            >
              破棄
            </Button>
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={() => void leaveWithDraft()}
            >
              下書きを残す
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiaryCreationProgressDialog progress={creationProgress} />
    </div>
  );
};
