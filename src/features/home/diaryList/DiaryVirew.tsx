import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDiaryList } from "../hooks/useDiaryList";
import { DiaryItem } from "./components/DiaryItem";

export const DiaryVirew = () => {
  const { dialies, loading } = useDiaryList();

  // console.log(dialies);
  // console.log(loading);

  return (
    <Card className="w-full items-start p-4 md:p-3 gap-4 md:gap-6">
      {dialies.map((diary, index) => (
        <div key={diary.id}>
          <DiaryItem diary={diary} />
          {index < dialies.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </Card>
  );
};
