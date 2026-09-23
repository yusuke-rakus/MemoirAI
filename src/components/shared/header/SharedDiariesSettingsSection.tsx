import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, Copy, Ellipsis, Eye, Unlink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { diaryQueryKeys, sharedDiaryQueryKeys } from "@/lib/query/queryKeys";
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
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: sharedDiaryQueryKeys.byOwner(uid ?? ""),
    enabled: Boolean(uid),
    queryFn: async () => {
      const diaries = await SharedDiaryClient.getByOwner<SharedDiary>(uid!);
      return diaries.slice().sort(sortBySharedAtDescending);
    },
  });
  const [selectedDiary, setSelectedDiary] = useState<OwnedSharedDiary | null>(
    null,
  );
  const [isUnsharing, setIsUnsharing] = useState(false);
  const copyLink = async (shareId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/shared/${shareId}`,
      );
      toast.success("共有リンクをコピーしました");
    } catch {
      toast.error(
        "コピーできませんでした。「公開内容を確認」からリンクを開いてコピーしてください。",
      );
    }
  };

  const handleUnshare = async () => {
    if (!selectedDiary) return;

    setIsUnsharing(true);
    try {
      await SharedDiaryClient.unpublish(selectedDiary.diary);
      await queryClient.invalidateQueries({
        queryKey: sharedDiaryQueryKeys.byOwner(uid ?? ""),
        refetchType: "all",
      });
      await queryClient.invalidateQueries({
        queryKey: diaryQueryKeys.all(uid ?? ""),
      });
      await queryClient.invalidateQueries({
        queryKey: ["sharedDiary", "status", uid ?? ""],
      });
      await queryClient.invalidateQueries({
        queryKey: sharedDiaryQueryKeys.byShareId(selectedDiary.sharedDiaryId),
      });
      setSelectedDiary(null);
      toast.success("共有を停止しました");
    } catch (error) {
      console.error("Failed to unshare diary from settings", error);
      toast.error("共有の停止に失敗しました");
    } finally {
      setIsUnsharing(false);
    }
  };

  if (query.isLoading && uid) {
    return (
      <div className="space-y-3" aria-label="共有した日記を読み込み中">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          共有した日記の取得に失敗しました。
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void query.refetch()}
        >
          再試行
        </Button>
      </div>
    );
  }

  return (
    <>
      {(query.data ?? []).length === 0 ? (
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
          {(query.data ?? []).map((sharedDiary) => (
            <div
              key={sharedDiary.sharedDiaryId}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3"
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
              <div className="flex flex-col items-end justify-between gap-3">
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="共有した日記の操作メニューを開く"
                    >
                      <Ellipsis />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    collisionPadding={8}
                    className="w-max max-w-[calc(100vw-1rem)] p-1"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto min-h-9 min-w-0 justify-start text-left whitespace-normal"
                        asChild
                      >
                        <Link to={`/shared/${sharedDiary.sharedDiaryId}`}>
                          <Eye />
                          <span className="min-w-0">公開内容を確認</span>
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto min-h-9 min-w-0 justify-start text-left whitespace-normal"
                        onClick={() => void copyLink(sharedDiary.sharedDiaryId)}
                      >
                        <Copy />
                        <span className="min-w-0">リンクをコピー</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDiary(sharedDiary)}
                >
                  <Unlink />
                  解除
                </Button>
              </div>
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
