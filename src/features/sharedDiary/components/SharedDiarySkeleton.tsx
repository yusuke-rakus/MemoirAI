import { DiaryCardSkeleton } from "@/components/shared/diary/DiaryCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const SharedDiarySkeleton = ({
  showGuestLink,
}: {
  showGuestLink: boolean;
}) => (
  <div
    role="status"
    aria-label="共有された日記を読み込み中"
    aria-busy="true"
    className="mx-auto flex max-w-4xl flex-col gap-4 pt-8 pb-10"
  >
    <span className="sr-only">共有された日記を読み込み中です</span>
    <div aria-hidden="true" className="flex flex-col gap-1">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-9 w-40" />
    </div>
    <DiaryCardSkeleton />
    {showGuestLink && (
      <div aria-hidden="true" className="flex justify-end pt-2">
        <Skeleton className="h-9 w-40" />
      </div>
    )}
  </div>
);
