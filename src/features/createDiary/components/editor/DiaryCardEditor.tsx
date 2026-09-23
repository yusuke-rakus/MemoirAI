import { Plus, X } from "lucide-react";
import type { KeyboardEvent } from "react";

import { DiaryMarkdownEditor } from "@/components/shared/diary/DiaryMarkdownEditor";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DiaryCard } from "@/features/createDiary/hooks/useDiaryCard";

import { DiaryImagePicker } from "../DiaryImagePicker";

type DiaryCardEditorProps = {
  card: DiaryCard;
  dateKey: string;
  disabled: boolean;
  markdownEditorEnabled: boolean;
  placeholder: string;
  error?: string;
  tagInput: string;
  onAddImages: (
    cardId: string,
    files: File[],
  ) => {
    addedCount: number;
    unsupportedCount: number;
    limitExceeded: boolean;
  };
  onAddTag: (cardId: string) => void;
  onRemoveImage: (cardId: string, imageId: string) => void;
  onRemoveTag: (cardId: string, tagIndex: number) => void;
  onTagInputChange: (cardId: string, value: string) => void;
  onTagInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    cardId: string,
  ) => void;
  onUpdateBody: (cardId: string, body: string) => void;
};

export const DiaryCardEditor = ({
  card,
  dateKey,
  disabled,
  markdownEditorEnabled,
  placeholder,
  error,
  tagInput,
  onAddImages,
  onAddTag,
  onRemoveImage,
  onRemoveTag,
  onTagInputChange,
  onTagInputKeyDown,
  onUpdateBody,
}: DiaryCardEditorProps) => (
  <CardContent>
    <DiaryMarkdownEditor
      content={card.body}
      disabled={disabled}
      invalid={Boolean(error)}
      enabled={markdownEditorEnabled}
      resetKey={`${dateKey}:${card.id}`}
      previewClassName="max-h-[500px] min-h-[300px] border-none shadow"
    >
      <Textarea
        id={`diary-body-${card.id}`}
        aria-label="日記の本文"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `diary-body-error-${card.id}` : undefined}
        placeholder={placeholder}
        value={card.body}
        disabled={disabled}
        onChange={(event) => onUpdateBody(card.id, event.target.value)}
        className="max-h-[500px] min-h-[240px] resize-y overflow-y-auto leading-relaxed shadow placeholder:text-muted-foreground focus-visible:ring-2"
      />
    </DiaryMarkdownEditor>
    {error && (
      <p
        id={`diary-body-error-${card.id}`}
        role="alert"
        className="mt-2 text-sm text-destructive"
      >
        {error}
      </p>
    )}

    <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

    <div className="flex flex-wrap items-center gap-3 pt-2">
      <DiaryImagePicker
        cardId={card.id}
        images={card.images}
        disabled={disabled}
        onAddImages={onAddImages}
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
              disabled={disabled}
              onClick={() => onRemoveTag(card.id, tagIndex)}
              aria-label={`${tag.name}タグを削除`}
              className="size-6 rounded-full hover:bg-transparent hover:text-destructive [&_svg]:size-3"
            >
              <X className="h-3 w-3" />
            </Button>
          </span>
        ))}
      </div>

      <div className="relative flex min-w-[200px] items-center">
        <Input
          placeholder="タグを追加"
          aria-label="追加するタグ"
          disabled={disabled}
          value={tagInput}
          onChange={(event) => onTagInputChange(card.id, event.target.value)}
          onKeyDown={(event) => onTagInputKeyDown(event, card.id)}
          className="h-9 bg-transparent text-sm shadow placeholder:text-muted-foreground"
        />
        {tagInput && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-2 h-6 w-6"
            onClick={() => onAddTag(card.id)}
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
              disabled={disabled}
              aria-label={`${image.file.name}の画像を削除`}
              className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-sm"
              onClick={() => onRemoveImage(card.id, image.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    )}
  </CardContent>
);
