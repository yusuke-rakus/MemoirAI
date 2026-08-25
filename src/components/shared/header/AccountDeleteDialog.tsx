import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AccountDeleteDialogProps = {
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

export const AccountDeleteDialog = ({
  open,
  isDeleting,
  onOpenChange,
  onDelete,
}: AccountDeleteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="sm:max-w-md"
      onEscapeKeyDown={(event) => isDeleting && event.preventDefault()}
      onInteractOutside={(event) => isDeleting && event.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>アカウントを削除しますか？</DialogTitle>
        <DialogDescription className="space-y-3">
          <span className="block">
            ユーザー情報、日記、画像、プロフィール、設定、AIメモリ、共有コピーをすべて削除します。この操作は取り消せず、データは復元できません。
          </span>
          <span className="block">
            契約同意記録のみ5年間保持します。また、他のユーザーのお気に入りには、表示できない共有日記の参照が一時的に残る場合があります。
          </span>
          <span className="block font-medium text-foreground">
            続行すると、Googleによる本人確認が表示されます。
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex-row gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-none"
          disabled={isDeleting}
          onClick={() => onOpenChange(false)}
        >
          キャンセル
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="flex-1 sm:flex-none"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? "削除中…" : "削除する"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
