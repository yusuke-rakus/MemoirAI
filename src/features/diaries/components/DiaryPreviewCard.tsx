import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Diary } from "@/types/diary/diary";
import { Tag } from "lucide-react";
import { DiaryTag } from "../../createDiary/components/DiaryTag";

type DiaryPreviewCardProps = {
  diary: Diary;
};

export const DiaryPreviewCard = ({ diary }: DiaryPreviewCardProps) => {
  return (
    <Card className="py-3">
      <CardContent className="flex flex-col gap-3">
        <CardHeader className="px-0">
          <CardTitle>{diary.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {diary.content}
          </p>
        </CardContent>
        {diary.tags.length >= 1 && (
          <CardFooter className="p-0 flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-ring" />
            {diary.tags.map((tag, i) => (
              <DiaryTag key={i} tag={tag} />
            ))}
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
};
