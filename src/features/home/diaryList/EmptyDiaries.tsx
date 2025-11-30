import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Notebook } from "lucide-react";

export function EmptyDiaries() {
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
          <Button>日記を作成する</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
