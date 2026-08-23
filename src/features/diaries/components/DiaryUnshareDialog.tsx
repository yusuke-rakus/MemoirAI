import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DiaryUnshareDialogProps = {
  title: string;
  isOpen: boolean;
  isUnsharing: boolean;
  onOpenChange: (open: boolean) => void;
  onUnshare: () => Promise<void>;
};

export const DiaryUnshareDialog = ({
  title,
  isOpen,
  isUnsharing,
  onOpenChange,
  onUnshare,
}: DiaryUnshareDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (isUnsharing) return;

    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>共有を停止しますか？</DialogTitle>
          <DialogDescription>
            「{title}
            」の現在の共有リンクを無効にします。再共有すると新しいリンクが発行されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => handleOpenChange(false)}
            disabled={isUnsharing}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 sm:flex-none"
            onClick={onUnshare}
            disabled={isUnsharing}
          >
            {isUnsharing ? "停止中..." : "共有を停止する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
