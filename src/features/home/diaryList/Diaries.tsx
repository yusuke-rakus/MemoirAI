import { Separator } from "@/components/ui/separator";
import type { Diary } from "@/types/diary/diary";
import { DiaryItem } from "./components/DiaryItem";
import { EmptyDiaries } from "./EmptyDiaries";
import { Card } from "@/components/ui/card";

interface DiariesProps {
  dialies: Diary[];
}

export const Diaries = ({ dialies }: DiariesProps) => {
  return (
    <>
      {dialies.length > 0 ? (
        <Card className="w-full p-4 md:p-3 gap-0">
          {dialies.map((diary, index) => (
            <div key={index}>
              <DiaryItem key={index} diary={diary} />
              {index < dialies.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </Card>
      ) : (
        <EmptyDiaries />
      )}
    </>
  );
};
