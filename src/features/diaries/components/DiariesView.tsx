import { format } from "date-fns";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { DiaryCardSkeleton } from "@/components/shared/diary/DiaryCardSkeleton";
import { Button } from "@/components/ui/button";
import { FadeContent } from "@/components/ui/fade-content";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import type { DiaryDetailNavigationState } from "../types";
import { DiaryPreviewCard } from "./DiaryPreviewCard";
import { EmptyDiaries } from "./EmptyDiaries";

const RETURN_PATH_PATTERN = /^\/(?:diaries|calendar)\/\d{4}\/(?:[1-9]|1[0-2])$/;

const getReturnTo = (state: unknown) => {
  if (typeof state !== "object" || state === null || !("returnTo" in state)) {
    return null;
  }

  const { returnTo } = state as DiaryDetailNavigationState;
  return typeof returnTo === "string" && RETURN_PATH_PATTERN.test(returnTo)
    ? returnTo
    : null;
};

export const DiariesView = () => {
  const { date } = useDiaryDetailStore();
  const { diaries, refetch, isLoading, error } = useFetchDiary();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = getReturnTo(location.state);
  const diarySaved = location.state?.diarySaved === true;
  const saveConfirmation = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (diarySaved) saveConfirmation.current?.focus();
  }, [diarySaved, location.key]);

  useEffect(() => {
    if (!window.location.hash || diaries.length === 0) return;
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView({ block: "start" });
    target?.focus();
  }, [diaries]);

  return (
    <div
      className={cn(
        "mx-auto mb-10 flex max-w-2xl flex-col gap-4",
        returnTo ? "pt-4" : "pt-8",
      )}
    >
      {diarySaved && (
        <p
          ref={saveConfirmation}
          tabIndex={-1}
          className="flex items-center gap-2 rounded-lg border border-primary/25 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground"
        >
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          日記をアカウントに保存しました
        </p>
      )}
      {returnTo && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="-ml-1 self-start text-muted-foreground"
          onClick={() => navigate(returnTo, { replace: true })}
        >
          <ChevronLeft aria-hidden="true" />
          戻る
        </Button>
      )}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold">{format(date, "yyyy年M月d日")}</h2>
        {isLoading ? (
          <Skeleton aria-hidden="true" className="h-5 w-52" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {diaries.length > 0 &&
              `この日は ${diaries.length} 件の記録があります`}
          </p>
        )}
      </div>
      <div>
        {isLoading ? (
          <div role="status" aria-label="日記を読み込み中" aria-busy="true">
            <span className="sr-only">日記を読み込み中です</span>
            <DiaryCardSkeleton showActions />
          </div>
        ) : error ? (
          <div role="alert" className="space-y-3">
            <p>日記を読み込めませんでした。通信状態を確認してください。</p>
            <Button variant="outline" onClick={() => void refetch()}>
              再試行
            </Button>
          </div>
        ) : diaries.length > 0 ? (
          <FadeContent key={format(date, "yyyy-MM-dd")} className="space-y-4">
            {diaries.map((diary) => (
              <DiaryPreviewCard
                key={diary.id}
                diary={diary}
                onCompleted={refetch}
              />
            ))}
          </FadeContent>
        ) : (
          <EmptyDiaries />
        )}
      </div>
    </div>
  );
};
