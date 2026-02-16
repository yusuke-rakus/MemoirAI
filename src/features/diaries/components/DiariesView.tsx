import { format } from "date-fns";
import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { DiaryPreviewCard } from "./DiaryPreviewCard";
import { EmptyDiaries } from "./EmptyDiaries";

export const DiariesView = () => {
  const { date, uploadedDiaries } = useDiaryDetailStore();
  useFetchDiary();

  return (
    <div className="max-w-4xl mx-auto pt-8 flex flex-col gap-4 mb-10">
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
            {uploadedDiaries.map((diary, i) => (
              <DiaryPreviewCard key={i} diary={diary} />
            ))}
          </div>
        ) : (
          <EmptyDiaries />
        )}
      </div>
    </div>
  );
};
