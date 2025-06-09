import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import type { Diary } from "@/types/diary/diary";
import { Separator } from "@radix-ui/react-separator";
import { Car } from "lucide-react";
import { DayIcon } from "./DayIcon";
import { DiaryTag } from "./DiaryTag";

type DiaryItemProps = {
  diary: Diary;
};
export const DiaryItem = (props: DiaryItemProps) => {
  const { diary } = props;
  return (
    <CardContent className="w-full px-0">
      <div className="flex transition-all hover:shadow-md">
        <DayIcon date={new Date()} />
        <div className="mx-2">
          {/* <CardHeader className="p-0 mb-2"> */}
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-slate-600" />
            {diary.title}
          </CardTitle>
          {/* </CardHeader> */}
          <CardContent className="p-0 mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {diary.content}
            </p>
          </CardContent>
          <CardFooter className="p-0 flex flex-wrap gap-2">
            {diary.tags.map((tag) => {
              return <DiaryTag tag={tag} />;
            })}
          </CardFooter>
        </div>
      </div>
      <Separator className="border-dashed" />
    </CardContent>
  );
};
