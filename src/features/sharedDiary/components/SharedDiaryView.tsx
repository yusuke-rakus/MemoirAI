import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PATHS } from "@/constants/path";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { DiaryTag } from "../../createDiary/components/DiaryTag";
import { useSharedDiary } from "../hooks/useSharedDiary";

export const SharedDiaryView = () => {
  const { diary, isLoading } = useSharedDiary();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">共有日記を読み込んでいます...</p>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="py-10">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>共有された日記が見つかりません</EmptyTitle>
            <EmptyDescription>
              リンクが無効か、共有が停止されている可能性があります。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to={PATHS.login.path}>ログインページへ</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-10 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">共有された日記</p>
        <h2 className="text-3xl font-bold">{format(diary.date.toDate(), "M月d日")}</h2>
      </div>
      <Card className="py-3">
        <CardContent className="flex flex-col gap-3">
          <CardHeader className="px-0">
            <CardTitle>{diary.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <p className="text-muted-foreground whitespace-pre-wrap">{diary.content}</p>
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
    </div>
  );
};
