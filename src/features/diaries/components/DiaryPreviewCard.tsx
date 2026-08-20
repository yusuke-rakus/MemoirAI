import LineIcon from "@/components/shared/Icons/LineIcon";
import XIcon from "@/components/shared/Icons/XIcon";
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
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PATHS } from "@/constants/path";
import {
  formatDiaryUpdatedAt,
  getDiaryUpdatedAt,
} from "@/lib/formatDiaryUpdatedAt";
import { cn } from "@/lib/utils";
import type { Diary } from "@/types/diary/diary";
import { format, isSameDay } from "date-fns";
import {
  Ellipsis,
  Link,
  Loader2,
  Pencil,
  Share2,
  Tag,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiaryTag } from "../../createDiary/components/DiaryTag";
import {
  type DiaryPreviewMutationValues,
  useDiaryPreviewActions,
} from "../hooks/useDiaryPreviewActions";
import { useShareDiary } from "../hooks/useShareDiary";
import { DiaryDeleteDialog } from "./DiaryDeleteDialog";
import { DiaryEditDialog } from "./DiaryEditDialog";
import { DiaryImageGrid } from "./DiaryImageGrid";

type DiaryPreviewCardProps = {
  diary: Diary;
  onCompleted: () => Promise<void>;
};

export const DiaryPreviewCard = ({
  diary,
  onCompleted,
}: DiaryPreviewCardProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isSharing, copyShareLink, shareToLine, shareToX } =
    useShareDiary(diary);
  const { isUpdating, isDeleting, updateDiary, deleteDiary } =
    useDiaryPreviewActions({
      diary,
      onCompleted,
    });
  const updatedAt = getDiaryUpdatedAt(diary);

  const handleUpdate = async (values: DiaryPreviewMutationValues) => {
    const isUpdated = await updateDiary(values);

    if (isUpdated) {
      setIsEditDialogOpen(false);

      if (isSameDay(values.date, diary.date.toDate())) {
        await onCompleted();
        return;
      }

      const dateString = format(values.date, "yyyy-MM-dd");
      navigate(`${PATHS.diaries.path}/${dateString}`);
    }
  };

  const handleDelete = async () => {
    const isDeleted = await deleteDiary();

    if (isDeleted) {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditSelect = useCallback(() => {
    setIsMenuOpen(false);
    requestAnimationFrame(() => setIsEditDialogOpen(true));
  }, []);

  const handleDeleteSelect = useCallback(() => {
    setIsMenuOpen(false);
    requestAnimationFrame(() => setIsDeleteDialogOpen(true));
  }, []);

  return (
    <>
      <Card
        id={`diary-${diary.id}`}
        tabIndex={-1}
        className={cn(
          "scroll-mt-20 overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          diary.images && diary.images.length > 0 ? "pt-0 pb-3" : "py-3",
        )}
      >
        {diary.images && diary.images.length > 0 && (
          <CardContent className="px-0 pb-0">
            <DiaryImageGrid images={diary.images} />
          </CardContent>
        )}
        <CardContent className="flex flex-col gap-3">
          <CardHeader className="flex flex-row items-start justify-between gap-2 px-0">
            <CardTitle>{diary.title}</CardTitle>
            <DropdownMenu
              modal={false}
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="日記の操作メニューを開く"
                >
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-fit p-2">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className="justify-start"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                    ) : (
                      <Share2 className="mr-2 h-4 w-4 flex-shrink-0" />
                    )}
                    共有
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        リンクで共有
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="justify-start"
                        disabled={isSharing}
                        onSelect={() => {
                          void copyShareLink();
                        }}
                      >
                        <Link />
                        リンクをコピー
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        SNSで共有
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="justify-start"
                        disabled={isSharing}
                        onSelect={() => {
                          void shareToLine();
                        }}
                      >
                        <LineIcon />
                        LINEで送る
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="justify-start"
                        disabled={isSharing}
                        onSelect={() => {
                          void shareToX();
                        }}
                      >
                        <XIcon />
                        Xで共有
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem
                  className="justify-start"
                  disabled={isUpdating || isDeleting}
                  onSelect={(event) => {
                    event.preventDefault();
                    handleEditSelect();
                  }}
                >
                  <Pencil />
                  編集
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-start"
                  disabled={isUpdating || isDeleting}
                  variant="destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    handleDeleteSelect();
                  }}
                >
                  <Trash2 />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="px-2">
            <p className="max-w-[70ch] whitespace-pre-wrap text-foreground/80">
              {diary.content}
            </p>
          </CardContent>
          <CardFooter className="flex items-end gap-3 p-0">
            {diary.tags.length >= 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-ring" />
                {diary.tags.map((tag, i) => (
                  <DiaryTag key={`${tag.name}-${i}`} tag={tag} />
                ))}
              </div>
            )}
            <time
              dateTime={updatedAt.toISOString()}
              className="ml-auto shrink-0 text-xs text-muted-foreground/60"
            >
              {formatDiaryUpdatedAt(diary)}
            </time>
          </CardFooter>
        </CardContent>
      </Card>
      <DiaryEditDialog
        diary={diary}
        isOpen={isEditDialogOpen}
        isSubmitting={isUpdating}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdate}
      />
      <DiaryDeleteDialog
        title={diary.title}
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </>
  );
};
