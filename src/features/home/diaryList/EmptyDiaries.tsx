import { format } from "date-fns";
import { Notebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PATHS } from "@/constants/path";

interface EmptyDiariesProps {
  date?: Date;
  period?: "day" | "month";
}

export function EmptyDiaries({ date, period = "day" }: EmptyDiariesProps) {
  const navigate = useNavigate();
  const dateString = format(date ?? new Date(), "yyyy-MM-dd");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Notebook />
        </EmptyMedia>
        <EmptyTitle>
          {date
            ? format(date, period === "month" ? "yyyy年M月" : "yyyy年M月d日")
            : "この日"}
          の日記はありません
        </EmptyTitle>
        <EmptyDescription>
          {period === "month"
            ? "別の月を選ぶか、この月の出来事を記録してみましょう。"
            : "この日の出来事や気持ちを記録してみましょう。"}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`${PATHS.newDiary.path}/${dateString}`)}
          >
            日記を作成する
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
