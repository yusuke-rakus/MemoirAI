import { Card } from "@/components/ui/card";
import { useDiaryList } from "../hooks/useDiaryList";
import { DiaryItem } from "./components/DiaryItem";

export const DiaryVirew = () => {
  const { dialies, loading } = useDiaryList();

  // console.log(dialies);
  // console.log(loading);

  return (
    <>
      <Card className="w-full items-start p-4 md:p-6 gap-4 md:gap-6">
        {dialies.map((diary) => {
          return <DiaryItem diary={diary} />;
        })}
      </Card>
    </>
  );
};
