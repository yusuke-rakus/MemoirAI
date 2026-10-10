import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const DiaryCardSkeleton = ({
  showActions = false,
}: {
  showActions?: boolean;
}) => (
  <Card aria-hidden="true" className="overflow-hidden py-3">
    <CardContent className="flex flex-col gap-3">
      <CardHeader
        className={cn(
          "px-0",
          showActions && "flex flex-row items-start justify-between gap-2",
        )}
      >
        <Skeleton className="h-4 w-2/3" />
        {showActions && <Skeleton className="size-9 shrink-0" />}
      </CardHeader>
      <CardContent className="space-y-3 px-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="flex items-end gap-3 p-0">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="ml-auto h-3 w-20 shrink-0" />
      </CardFooter>
    </CardContent>
  </Card>
);
