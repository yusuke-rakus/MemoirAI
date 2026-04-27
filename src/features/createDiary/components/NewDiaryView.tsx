import { useRotatingText } from "@/components/shared/common/useRotatingText";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { useEffect, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { useDiaryCard } from "../hooks/useDiaryCard";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { usePickMessages } from "../hooks/usePickMessages";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { DiaryImagePicker } from "./DiaryImagePicker";

export const NewDiaryView = () => {
  const navigate = useNavigate();
  const { date, setDate } = useDiaryDetailStore();
  useFetchDiary();
  const { isCreating, onSave } = useCreateDiary();
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

  const { pickRandomMessages } = usePickMessages();
  const placeholderText = useRotatingText(pickRandomMessages);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const customSetDate = (date: Date) => {
    setDate(date);
    const dateString = format(date, "yyyy-MM-dd");
    navigate(`${PATHS.newDiary.path}/${dateString}`);
  };

  useEffect(() => {
    reset(date);
  }, [date, reset]);

  const handleSave = async () => {
    await onSave();
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

  const handleCardDrop = (
    event: DragEvent<HTMLElement>,
    cardId: string,
  ) => {
    if (!hasDraggedFiles(event)) return;

    event.preventDefault();
    setDraggingCardId(null);

    if (isCreating) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    showAddImagesResult(addImages(cardId, files));
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3 text-muted-foreground group">
            <Popover>
              <PopoverTrigger asChild>
                <CalendarIcon className="h-5 w-5 group-hover:text-primary transition-colors" />
              </PopoverTrigger>
              <span className="text-lg font-medium tracking-tight">
                {format(date, "M月d日")}
              </span>
              <PopoverContent className="w-fit">
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

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <Button
              onClick={handleSave}
              disabled={isCreating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-10 rounded-md font-medium shadow-sm transition-all active:scale-[0.98]"
            >
              {isCreating ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "border-none shadow-sm bg-card/50 hover:bg-card/80 transition-all duration-300",
                "backdrop-blur-sm group relative overflow-visible",
                draggingCardId === card.id &&
                  "ring-2 ring-primary/60 bg-accent/30",
              )}
              onDragEnter={(event) => handleCardDragEnter(event, card.id)}
              onDragOver={(event) => handleCardDragOver(event, card.id)}
              onDragLeave={handleCardDragLeave}
              onDrop={(event) => handleCardDrop(event, card.id)}
            >
              {/* Card Remove Button (visible on hover or if multiple) */}
              {cards.length > 1 && (
                <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCard(card.id)}
                    className="h-8 w-8 rounded-full bg-background border border-border shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground group-hover:text-foreground transition-colors">
                  今日の出来事を書き留めよう ✨
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Textarea
                  placeholder={placeholderText}
                  value={card.body}
                  onChange={(e) => updateCardBody(card.id, e.target.value)}
                  className="min-h-[300px] max-h-[500px] overflow-y-auto leading-relaxed resize-none shadow border-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
                />

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
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-sm font-medium transition-colors hover:bg-secondary"
                      >
                        {tag.name}
                        <button
                          onClick={() => removeTag(card.id, tagIndex)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="relative flex items-center min-w-[200px]">
                    <Input
                      placeholder="タグを追加"
                      value={tagInputs[card.id] || ""}
                      onChange={(e) =>
                        handleTagInputChange(card.id, e.target.value)
                      }
                      onKeyDown={(e) => handleTagInputKeyDown(e, card.id)}
                      className="h-8 text-sm border-none shadow bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    />
                    {tagInputs[card.id] && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 ml-2"
                        onClick={() => addTag(card.id)}
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
                          className="absolute right-1 top-1 h-6 w-6 rounded-full shadow-sm"
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
            className="rounded-full px-6 py-6 h-auto border-dashed border-border hover:border-primary/50 hover:bg-accent/5 transition-all group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            セクションを追加
          </Button>
        </div>
      </div>
    </div>
  );
};
