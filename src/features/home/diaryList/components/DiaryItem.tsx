import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATHS } from "@/constants/path";
import type { Diary } from "@/types/diary/diary";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DayIcon } from "./DayIcon";
import { DiaryTag } from "./DiaryTag";

type DiaryItemProps = {
  diary: Diary;
};

export const DiaryItem = (props: DiaryItemProps) => {
  const { diary } = props;
  const navigate = useNavigate();

  const handleSearch = () => {
    const dateStr = format(diary.date.toDate(), "yyyy-MM-dd");
    navigate(`${PATHS.newDiary.path}/${dateStr}`);
  };

  return (
    <CardContent onClick={handleSearch} className="px-0 cursor-pointer">
      <div className="flex rounded-sm transition-all hover:bg-ring/20 p-2">
        <DayIcon date={diary.date.toDate()} />
        <div className="flex-1 mx-2">
          <CardHeader className="p-0 mb-2 w-full">
            <CardTitle className="text-lg">{diary.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {diary.content}
            </p>
          </CardContent>
          {diary.tags && diary.tags.length > 0 && (
            <CardFooter className="p-0 flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-ring" />
              {diary.tags.map((tag, i) => (
                <DiaryTag key={i} tag={tag} />
              ))}
            </CardFooter>
          )}
        </div>
      </div>
    </CardContent>
  );
};
