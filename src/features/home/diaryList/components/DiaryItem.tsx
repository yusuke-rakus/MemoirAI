import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Diary } from "@/types/diary/diary";
import { DayIcon } from "./DayIcon";
import { DiaryTag } from "./DiaryTag";
import { useEffect } from "react";

type DiaryItemProps = {
  diary: Diary;
};

export const DiaryItem = (props: DiaryItemProps) => {
  const { diary } = props;

  const handleSearch = () => {
    console.log(diary);
  };

  useEffect(() => {
    // console.log(diary.date.seconds);
    console.log(diary.date.toDate());
  }, []);

  return (
    <CardContent onClick={handleSearch} className="w-full px-0 cursor-pointer">
      <div className="flex rounded-sm transition-all hover:bg-gray-100 p-2">
        <DayIcon date={diary.date.toDate()} />
        <div className="mx-2">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {diary.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {diary.content}
            </p>
          </CardContent>
          <CardFooter className="p-0 flex flex-wrap gap-2">
            {diary.tags.map((tag, i) => (
              <DiaryTag key={i} tag={tag} />
            ))}
          </CardFooter>
        </div>
      </div>
    </CardContent>
  );
};
