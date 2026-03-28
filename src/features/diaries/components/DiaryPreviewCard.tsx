import LineIcon from "@/components/shared/Icons/LineIcon";
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Diary } from "@/types/diary/diary";
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
import { DiaryTag } from "../../createDiary/components/DiaryTag";
import {
  type DiaryPreviewMutationValues,
  useDiaryPreviewActions,
} from "../hooks/useDiaryPreviewActions";
import { useShareDiary } from "../hooks/useShareDiary";
import { DiaryDeleteDialog } from "./DiaryDeleteDialog";
import { DiaryEditDialog } from "./DiaryEditDialog";

type DiaryPreviewCardProps = {
  diary: Diary;
  onCompleted: () => Promise<void>;
};

export const DiaryPreviewCard = ({
  diary,
  onCompleted,
}: DiaryPreviewCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isSharing, copyShareLink, shareToLine } = useShareDiary(diary);
  const { isUpdating, isDeleting, updateDiary, deleteDiary } =
    useDiaryPreviewActions({
      diary,
      onCompleted,
    });

  const handleUpdate = async (values: DiaryPreviewMutationValues) => {
    const isUpdated = await updateDiary(values);

    if (isUpdated) {
      setIsEditDialogOpen(false);
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
      <Card className="py-3">
        <CardContent className="flex flex-col gap-3">
          <CardHeader className="px-0 flex flex-row items-start justify-between gap-2">
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
                      <Loader2 className="flex-shrink-0 w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="flex-shrink-0 w-4 h-4 mr-2" />
                    )}
                    共有
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
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
            <p className="text-muted-foreground whitespace-pre-wrap">
              {diary.content}
            </p>
          </CardContent>
          {diary.tags.length >= 1 && (
            <CardFooter className="p-0 flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-ring" />
              {diary.tags.map((tag, i) => (
                <DiaryTag key={`${tag.name}-${i}`} tag={tag} />
              ))}
            </CardFooter>
          )}
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
