import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useDiaryList } from "../hooks/useDiaryList";
import { Diaries } from "./Diaries";

export const DiaryView = () => {
  const { dialies, loading } = useDiaryList();
  useDocumentTitle("日記一覧");

  const skeltonItemCount = 5;

  return (
    <>
      {loading ? (
        <Card className="w-full items-start p-4 md:p-3 gap-0">
          {Array.from({ length: skeltonItemCount }).map((_, i) => (
            <CardContent key={i} className="w-full px-0">
              <Skeleton className="h-[125px] w-full" />
              {i < skeltonItemCount - 1 && <Separator className="my-4" />}
            </CardContent>
          ))}
        </Card>
      ) : (
        <Diaries dialies={dialies} />
      )}
    </>
  );
};
