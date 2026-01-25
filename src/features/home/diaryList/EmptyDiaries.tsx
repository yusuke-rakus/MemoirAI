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
import { Notebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EmptyDiaries() {
  const navigate = useNavigate();
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
          <Button onClick={() => navigate(PATHS.newDiary.path)}>
            日記を作成する
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
