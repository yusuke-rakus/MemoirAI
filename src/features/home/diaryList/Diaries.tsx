import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Diary } from "@/types/diary/diary";

import { DiaryItem } from "./components/DiaryItem";
import { EmptyDiaries } from "./EmptyDiaries";

interface DiariesProps {
  dialies: Diary[];
  date?: Date;
  period?: "day" | "month";
}

export const Diaries = ({
  dialies,
  date,
  period = "day",
}: DiariesProps) => {
  return (
    <>
      {dialies.length > 0 ? (
        <Card className="w-full gap-0 p-4 md:p-3">
          {dialies.map((diary, index) => (
            <div key={diary.id}>
              <DiaryItem diary={diary} />
              {index < dialies.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </Card>
      ) : (
        <EmptyDiaries date={date} period={period} />
      )}
    </>
  );
};
