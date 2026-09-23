import { Skeleton } from "@/components/ui/skeleton";

export const ContentSkeleton = () => (
  <div role="status" aria-label="内容を読み込み中" className="space-y-6 py-8">
    <span className="sr-only">内容を読み込み中です</span>
    <Skeleton className="h-9 w-48" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);
