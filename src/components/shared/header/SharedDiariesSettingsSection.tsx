import { format } from "date-fns";
import { BookOpen, Unlink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SharedDiaryClient,
  type SharedDiaryResult,
} from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";

type Props = {
  uid?: string;
};

type OwnedSharedDiary = SharedDiaryResult<SharedDiary>;

const sortBySharedAtDescending = (
  first: OwnedSharedDiary,
  second: OwnedSharedDiary,
) => second.diary.sharedAt.toMillis() - first.diary.sharedAt.toMillis();

export const SharedDiariesSettingsSection = ({ uid }: Props) => {
  const [diaries, setDiaries] = useState<OwnedSharedDiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<OwnedSharedDiary | null>(
    null,
  );
  const [isUnsharing, setIsUnsharing] = useState(false);

  const fetchSharedDiaries = useCallback(async () => {
    if (!uid) {
      setDiaries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const sharedDiaries =
        await SharedDiaryClient.getByOwner<SharedDiary>(uid);
      setDiaries(sharedDiaries.sort(sortBySharedAtDescending));
    } catch (error) {
      console.error("Failed to fetch owned shared diaries", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void fetchSharedDiaries();
  }, [fetchSharedDiaries]);

  const handleUnshare = async () => {
    if (!selectedDiary) return;

    setIsUnsharing(true);
    try {
      await SharedDiaryClient.unpublish(selectedDiary.diary);
      setDiaries((current) =>
        current.filter(
          (diary) => diary.sharedDiaryId !== selectedDiary.sharedDiaryId,
        ),
      );
      setSelectedDiary(null);
      toast.success("共有を停止しました");
    } catch (error) {
      console.error("Failed to unshare diary from settings", error);
      toast.error("共有の停止に失敗しました");
    } finally {
      setIsUnsharing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="共有した日記を読み込み中">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          共有した日記の取得に失敗しました。
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void fetchSharedDiaries()}
        >
          再試行
        </Button>
      </div>
    );
  }

  return (
    <>
      {diaries.length === 0 ? (
        <Empty className="min-h-56 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>共有した日記はありません</EmptyTitle>
            <EmptyDescription>
              日記のメニューから共有すると、ここで管理できます。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="divide-y rounded-md border">
          {diaries.map((sharedDiary) => (
            <div
              key={sharedDiary.sharedDiaryId}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {sharedDiary.diary.title}
                </p>
                <time
                  dateTime={sharedDiary.diary.sharedAt.toDate().toISOString()}
                  className="mt-1 block truncate text-xs text-muted-foreground"
                >
                  {format(sharedDiary.diary.sharedAt.toDate(), "yyyy年M月d日")}
                  に共有
                </time>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setSelectedDiary(sharedDiary)}
              >
                <Unlink />
                解除
              </Button>
            </div>
          ))}
        </div>
      )}
      <Dialog
        open={selectedDiary !== null}
        onOpenChange={(open) => {
          if (!open && !isUnsharing) setSelectedDiary(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>共有を解除しますか？</DialogTitle>
            <DialogDescription>
              「{selectedDiary?.diary.title ?? ""}
              」の現在の共有リンクを無効にします。再共有すると新しいリンクが発行されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={isUnsharing}
              onClick={() => setSelectedDiary(null)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 sm:flex-none"
              disabled={isUnsharing}
              onClick={() => void handleUnshare()}
            >
              {isUnsharing ? "解除中..." : "共有を解除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
