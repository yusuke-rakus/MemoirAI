import { Button } from "@/components/ui/button";
import {
  MAX_DIARY_IMAGE_COUNT,
  SUPPORTED_DIARY_IMAGE_TYPES,
} from "@/constants/diaryImages";
import { Image } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { DiaryCardImage } from "../hooks/useDiaryCard";

type DiaryImagePickerProps = {
  cardId: string;
  images: DiaryCardImage[];
  disabled?: boolean;
  onAddImages: (
    cardId: string,
    files: File[],
  ) => {
    addedCount: number;
    unsupportedCount: number;
    limitExceeded: boolean;
  };
};

export const DiaryImagePicker = ({
  cardId,
  images,
  disabled,
  onAddImages,
}: DiaryImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isLimitReached = images.length >= MAX_DIARY_IMAGE_COUNT;

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const result = onAddImages(cardId, files);

    if (result.unsupportedCount > 0) {
      toast.error("JPEG、PNG、WebP、HEIC/HEIFの画像のみ追加できます");
    }

    if (result.limitExceeded) {
      toast.error("画像は1つの日記につき2枚まで追加できます");
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_DIARY_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleSelectImages}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || isLimitReached}
        aria-label="画像を追加"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => inputRef.current?.click()}
      >
        <Image className="h-4 w-4" />
      </Button>
    </>
  );
};
