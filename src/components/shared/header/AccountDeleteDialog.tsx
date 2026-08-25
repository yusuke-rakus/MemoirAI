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
      <DialogHeader className="text-left">
        <DialogTitle>アカウントを削除しますか？</DialogTitle>
        <DialogDescription asChild>
          <div className="space-y-4 text-left text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium text-foreground">削除されるデータ</p>
              <p>
                ユーザー情報、日記、画像、プロフィール、設定、AIメモリ、共有コピーをすべて削除します。
              </p>
              <p className="font-medium text-destructive">
                削除後はデータを復元できません。
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">保持される情報</p>
              <p>
                契約・紛争対応のため、必要最小限の契約同意記録のみ5年間保持します。
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                他のユーザーのお気に入り
              </p>
              <p>表示できない共有日記の参照が一時的に残る場合があります。</p>
            </div>
            <p className="border-t pt-3 font-medium text-foreground">
              「削除する」を押すと、Googleによる本人確認が表示されます。
            </p>
          </div>
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
