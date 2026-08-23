import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DiaryDeleteDialogProps = {
  title: string;
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
};

export const DiaryDeleteDialog = ({
  title,
  isOpen,
  isDeleting,
  onOpenChange,
  onDelete,
}: DiaryDeleteDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return;

    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>日記を削除しますか？</DialogTitle>
          <DialogDescription>
            「{title}
            」を削除します。共有中の場合は共有も停止されます。この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 sm:flex-none"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "削除する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
