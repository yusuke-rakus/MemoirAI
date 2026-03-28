import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { DefaultTagColor } from "@/constants/tagColors";
import type { Diary, Tag } from "@/types/diary/diary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const diaryEditSchema = z.object({
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
    values: Pick<Diary, "title" | "content" | "tags">,
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
  const form = useForm<DiaryEditFormValues>({
    resolver: zodResolver(diaryEditSchema),
    defaultValues: {
      title: diary.title,
      content: diary.content,
      tagsText: tagsToText(diary.tags),
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    form.reset({
      title: diary.title,
      content: diary.content,
      tagsText: tagsToText(diary.tags),
    });
  }, [diary.content, diary.tags, diary.title, form, isOpen]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      tags: parseTags(values.tagsText, diary.tags),
    });
  });

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return;

    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>日記を編集</DialogTitle>
          <DialogDescription>
            タイトル、本文、タグを更新できます。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="タイトルを入力" />
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
                    <Input {...field} placeholder="タグをカンマ区切りで入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
