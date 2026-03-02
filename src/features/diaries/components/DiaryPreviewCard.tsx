import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Diary } from "@/types/diary/diary";
import { Ellipsis, Loader2, Pencil, Share2, Tag, Trash2 } from "lucide-react";
import { DiaryTag } from "../../createDiary/components/DiaryTag";
import { useShareDiary } from "../hooks/useShareDiary";

type DiaryPreviewCardProps = {
  diary: Diary;
};

export const DiaryPreviewCard = ({ diary }: DiaryPreviewCardProps) => {
  const { isSharing, onShare } = useShareDiary(diary);

  return (
    <Card className="py-3">
      <CardContent className="flex flex-col gap-3">
        <CardHeader className="px-0 flex flex-row items-start justify-between gap-2">
          <CardTitle>{diary.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit p-2">
              <div className="flex flex-col">
                <DropdownMenuItem
                  className="justify-start"
                  disabled={isSharing}
                  onClick={onShare}
                >
                  {isSharing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Share2 />
                  )}
                  共有
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-start" disabled>
                  <Pencil />
                  編集（未実装）
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-start text-destructive hover:text-destructive"
                  disabled
                >
                  <Trash2 />
                  削除（未実装）
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="px-2">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {diary.content}
          </p>
        </CardContent>
        {diary.tags.length >= 1 && (
          <CardFooter className="p-0 flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-ring" />
            {diary.tags.map((tag, i) => (
              <DiaryTag key={i} tag={tag} />
            ))}
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
};
