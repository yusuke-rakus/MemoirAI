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
import { format } from "date-fns";
import { Notebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyDiariesProps {
  date?: Date;
}

export function EmptyDiaries({ date }: EmptyDiariesProps) {
  const navigate = useNavigate();
  const dateString = format(date ?? new Date(), "yyyy-MM-dd");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Notebook />
        </EmptyMedia>
        <EmptyTitle>まだ日記がないようです ✏️</EmptyTitle>
        <EmptyDescription>
          日々の出来事や気持ちを記録してみましょう。下のボタンから最初の日記を作成できます。
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
