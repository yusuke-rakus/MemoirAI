import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const { date, uploadedDiaries } = useDiaryDetailStore();
  const { refetch } = useFetchDiary();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = getReturnTo(location.state);

  useEffect(() => {
    if (!window.location.hash || uploadedDiaries.length === 0) return;
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView({ block: "start" });
    target?.focus();
  }, [uploadedDiaries]);

  return (
    <div
      className={cn(
        "mx-auto mb-10 flex max-w-2xl flex-col gap-4",
        returnTo ? "pt-4" : "pt-8",
      )}
    >
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
        <h2 className="text-3xl font-bold">{format(date, "M月d日")}</h2>
        <p className="text-sm text-muted-foreground">
          {uploadedDiaries.length > 0 &&
            `本日は ${uploadedDiaries.length} 件の記録があります`}
        </p>
      </div>
      <div>
        {uploadedDiaries.length > 0 ? (
          <div className="space-y-4">
            {uploadedDiaries.map((diary) => (
              <DiaryPreviewCard
                key={diary.id}
                diary={diary}
                onCompleted={refetch}
              />
            ))}
          </div>
        ) : (
          <EmptyDiaries />
        )}
      </div>
    </div>
  );
};
