import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const DiaryListSkeleton = () => (
  <div role="status" aria-label="日記を読み込み中" aria-busy="true">
    <span className="sr-only">日記を読み込み中です</span>
    <Card aria-hidden="true" className="w-full gap-0 p-4 md:p-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
          <div className="flex rounded-sm p-2">
            <div className="flex w-16 shrink-0 flex-col items-center gap-1">
              <Skeleton className="h-5 w-4" />
              <Skeleton className="size-16 rounded-full" />
            </div>
            <div className="mx-2 min-w-0 flex-1">
              <CardHeader className="mb-2 w-full p-0">
                <Skeleton className="h-[18px] w-2/3" />
              </CardHeader>
              <CardContent className="mb-4 space-y-2 p-0">
                <Skeleton className="h-[15px] w-full" />
                <Skeleton className="h-[15px] w-full" />
                <Skeleton className="h-[15px] w-4/5" />
                <Skeleton className="h-[15px] w-1/2" />
              </CardContent>
              <CardFooter className="flex flex-wrap items-end gap-3 p-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="ml-auto h-4 w-20 shrink-0" />
              </CardFooter>
            </div>
          </div>
          {index < 4 && <Separator className="my-2" />}
        </div>
      ))}
    </Card>
  </div>
);
