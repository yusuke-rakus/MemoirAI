import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_DIARY_IMAGE_COUNT,
  SUPPORTED_DIARY_IMAGE_TYPES,
} from "@/constants/diaryImages";
import { DefaultTagColor } from "@/constants/tagColors";
import type { Diary, DiaryImage, Tag } from "@/types/diary/diary";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useDiaryEditImages } from "../hooks/useDiaryEditImages";

const diaryEditSchema = z.object({
  date: z.date(),
  title: z.string().trim().min(1, "タイトルを入力してください"),
  content: z.string().trim().min(1, "本文を入力してください"),
  tagsText: z.string(),
});

type DiaryEditFormValues = z.infer<typeof diaryEditSchema>;

type DiaryEditDialogProps = {
  diary: Diary;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: Pick<Diary, "title" | "content" | "tags"> & {
      date: Date;
      retainedImages: DiaryImage[];
      newImageFiles: File[];
    },
  ) => Promise<void>;
};

const tagsToText = (tags: Tag[]) => tags.map((tag) => tag.name).join(", ");

const parseTags = (tagsText: string, currentTags: Tag[]): Tag[] => {
  const currentTagMap = new Map(currentTags.map((tag) => [tag.name, tag]));
  const names = tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(names)).map((name) => {
    const existingTag = currentTagMap.get(name);

    return existingTag ?? { name, color: DefaultTagColor };
  });
};

export const DiaryEditDialog = ({
  diary,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: DiaryEditDialogProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const {
    retainedImages,
    newImages,
    imageCount,
    addImages,
    removeRetainedImage,
    removeNewImage,
  } = useDiaryEditImages({ images: diary.images, isOpen });
  const form = useForm<DiaryEditFormValues>({
    resolver: zodResolver(diaryEditSchema),
    defaultValues: {
      date: diary.date.toDate(),
      title: diary.title,
      content: diary.content,
      tagsText: tagsToText(diary.tags),
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    form.reset({
      date: diary.date.toDate(),
      title: diary.title,
      content: diary.content,
      tagsText: tagsToText(diary.tags),
    });
  }, [diary.content, diary.date, diary.tags, diary.title, form, isOpen]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      date: values.date,
      title: values.title.trim(),
      content: values.content.trim(),
      tags: parseTags(values.tagsText, diary.tags),
      retainedImages,
      newImageFiles: newImages.map((image) => image.file),
    });
  });

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const result = addImages(files);

    if (result.unsupportedCount > 0) {
      toast.error("JPEG、PNG、WebP、HEIC/HEIFの画像のみ追加できます");
    }

    if (result.limitExceeded) {
      toast.error(
        `画像は1つの日記につき${MAX_DIARY_IMAGE_COUNT}枚まで追加できます`,
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return;
    if (!open && form.formState.isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }

    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>日記を編集</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>日付</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {format(field.value, "yyyy年M月d日")}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-fit max-w-[calc(100vw-1rem)] p-0"
                        align="start"
                        sideOffset={8}
                        collisionPadding={8}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(selectedDate) => {
                            if (selectedDate) field.onChange(selectedDate);
                          }}
                          captionLayout="dropdown"
                          disabled={isSubmitting}
                          required
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="タイトルを入力"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>本文</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        className="min-h-48 resize-y"
                        placeholder="本文を入力"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タグ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="タグをカンマ区切りで入力"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium leading-none">
                    画像（{imageCount}/{MAX_DIARY_IMAGE_COUNT}）
                  </p>
                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept={SUPPORTED_DIARY_IMAGE_TYPES.join(",")}
                    multiple
                    disabled={isSubmitting}
                    className="hidden"
                    onChange={handleSelectImages}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      isSubmitting || imageCount >= MAX_DIARY_IMAGE_COUNT
                    }
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                    画像を追加
                  </Button>
                </div>
                {imageCount > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {retainedImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted"
                      >
                        <img
                          src={image.downloadURL}
                          alt={`${diary.title}の画像${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={isSubmitting}
                          aria-label={`画像${index + 1}を削除`}
                          className="absolute right-1 top-1 h-6 w-6 rounded-full shadow-sm"
                          onClick={() => removeRetainedImage(image.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {newImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted"
                      >
                        <img
                          src={image.previewUrl}
                          alt={`${image.file.name}のプレビュー`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={isSubmitting}
                          aria-label={`追加画像${index + 1}を削除`}
                          className="absolute right-1 top-1 h-6 w-6 rounded-full shadow-sm"
                          onClick={() => removeNewImage(image.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>
              <DialogFooter className="flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "保存中..." : "保存する"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>変更を破棄しますか？</DialogTitle>
            <DialogDescription>
              保存していない編集内容は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDiscardDialogOpen(false)}
            >
              編集を続ける
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsDiscardDialogOpen(false);
                form.reset();
                onOpenChange(false);
              }}
            >
              破棄する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
