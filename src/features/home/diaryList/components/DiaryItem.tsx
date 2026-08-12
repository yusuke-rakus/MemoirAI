import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATHS } from "@/constants/path";
import type { DiaryDetailNavigationState } from "@/features/diaries/types";
import type { Diary } from "@/types/diary/diary";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayIcon } from "./DayIcon";
import { DiaryTag } from "./DiaryTag";

type DiaryItemProps = {
  diary: Diary;
};

export const DiaryItem = (props: DiaryItemProps) => {
  const { diary } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = () => {
    const dateStr = format(diary.date.toDate(), "yyyy-MM-dd");
    const state = {
      returnTo: location.pathname,
    } satisfies DiaryDetailNavigationState;

    navigate(`${PATHS.diaries.path}/${dateStr}`, { state });
  };

  return (
    <CardContent onClick={handleSearch} className="cursor-pointer px-0">
      <div className="flex rounded-sm p-2 transition-all hover:bg-ring/10">
        <DayIcon date={diary.date.toDate()} />
        <div className="mx-2 flex-1">
          <CardHeader className="mb-2 w-full p-0">
            <CardTitle className="text-lg">{diary.title}</CardTitle>
          </CardHeader>
          <CardContent className="mb-4 p-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {diary.content}
            </p>
            {diary.images && diary.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-3 sm:grid-cols-4">
                {diary.images.map((image, index) => (
                  <AspectRatio
                    key={image.id}
                    ratio={1 / 1}
                    className="overflow-hidden rounded-md bg-muted"
                  >
                    <img
                      src={image.downloadURL}
                      alt={`日記の画像 ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                ))}
              </div>
            )}
          </CardContent>
          {diary.tags && diary.tags.length > 0 && (
            <CardFooter className="flex flex-wrap gap-2 p-0">
              <Tag className="h-4 w-4 text-ring" />
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
