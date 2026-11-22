import { ChevronDown, Paperclip, Plus, X } from "lucide-react";
import type { KeyboardEvent } from "react";

import { DiaryMarkdownEditor } from "@/components/shared/diary/DiaryMarkdownEditor";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DiaryCard } from "@/types/diaryDraft";

import { DiaryImagePicker } from "../DiaryImagePicker";

type DiaryCardEditorProps = {
  card: DiaryCard;
  dateKey: string;
  disabled: boolean;
  allowImageUpload?: boolean;
  allowTagEditing?: boolean;
  markdownEditorEnabled: boolean;
  writingPromptId?: string;
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
  allowImageUpload = true,
  allowTagEditing = true,
  markdownEditorEnabled,
  writingPromptId,
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
  <CardContent className="px-4 sm:px-5">
    <DiaryMarkdownEditor
      content={card.body}
      disabled={disabled}
      invalid={Boolean(error)}
      enabled={markdownEditorEnabled}
      resetKey={`${dateKey}:${card.id}`}
      previewClassName="max-h-[500px] min-h-36 sm:min-h-56"
    >
      <Textarea
        id={`diary-body-${card.id}`}
        aria-label="日記の本文"
        aria-invalid={Boolean(error)}
        aria-describedby={
          [writingPromptId, error && `diary-body-error-${card.id}`]
            .filter(Boolean)
            .join(" ") || undefined
        }
        value={card.body}
        disabled={disabled}
        onChange={(event) => onUpdateBody(card.id, event.target.value)}
        className="max-h-[500px] min-h-36 resize-y overflow-y-auto px-3 py-2.5 leading-relaxed sm:min-h-56"
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

    {(allowImageUpload || allowTagEditing) && (
      <Collapsible className="mt-2" disabled={disabled}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="group h-9 gap-2 px-2 text-muted-foreground"
          >
            <Paperclip aria-hidden="true" />
            {allowImageUpload && allowTagEditing
              ? "写真・タグ"
              : allowImageUpload
                ? "写真"
                : "タグ"}
            {card.images.length + card.tags.length > 0 && (
              <span>({card.images.length + card.tags.length})</span>
            )}
            <ChevronDown
              aria-hidden="true"
              className="group-data-[state=open]:rotate-180"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {allowImageUpload && (
              <DiaryImagePicker
                cardId={card.id}
                images={card.images}
                disabled={disabled}
                onAddImages={onAddImages}
              />
            )}

            {allowTagEditing && (
              <>
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
                    onChange={(event) =>
                      onTagInputChange(card.id, event.target.value)
                    }
                    onKeyDown={(event) => onTagInputKeyDown(event, card.id)}
                    className="h-9 bg-transparent text-sm shadow placeholder:text-muted-foreground"
                  />
                  {tagInput && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={disabled}
                      className="ml-2 h-6 w-6"
                      onClick={() => onAddTag(card.id)}
                      aria-label="タグを追加"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
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
        </CollapsibleContent>
      </Collapsible>
    )}
  </CardContent>
);
