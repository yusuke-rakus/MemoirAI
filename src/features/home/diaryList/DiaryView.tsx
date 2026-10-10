import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import { useDiaryList } from "../hooks/useDiaryList";
import { useCurrentDateStore } from "../provider/CurrentDateProvider";
import { DiaryListSkeleton } from "./components/DiaryListSkeleton";
import { Diaries } from "./Diaries";

export const DiaryView = () => {
  const { dialies, loading, error, refetch } = useDiaryList();
  const { date } = useCurrentDateStore();
  useDocumentTitle("日記一覧");

  return (
    <div className="mb-10">
      {loading ? (
        <DiaryListSkeleton />
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p>日記を読み込めませんでした。</p>
          <Button variant="outline" onClick={() => void refetch()}>
            再試行
          </Button>
        </div>
      ) : (
        <Diaries dialies={dialies} date={date} period="month" />
      )}
    </div>
  );
};
