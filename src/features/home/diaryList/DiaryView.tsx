import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDiaryList } from "../hooks/useDiaryList";
import { DiaryItem } from "./components/DiaryItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const DiaryView = () => {
  const { dialies, loading } = useDiaryList();
  useDocumentTitle("日記一覧");

  const skeltonItemCount = 5;

  return (
    <Card className="w-full items-start p-4 md:p-3 gap-0">
      {loading
        ? Array.from({ length: skeltonItemCount }).map((_, i) => (
            <CardContent key={i} className="w-full px-0">
              <Skeleton className="h-[125px] w-full" />
              {i < skeltonItemCount - 1 && <Separator className="my-4" />}
            </CardContent>
          ))
        : dialies.map((diary, index) => (
            <div key={diary.id}>
              <DiaryItem key={index} diary={diary} />
              {index < dialies.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
    </Card>
  );
};
