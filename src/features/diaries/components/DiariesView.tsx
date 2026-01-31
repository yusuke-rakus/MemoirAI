import { useFetchDiary } from "../hooks/useFetchDiary";
import { useDiaryDetailStore } from "../provider/DiaryDetailProvider";
import { DiaryPreviewCard } from "./DiaryPreviewCard";
import { EmptyDiaries } from "./EmptyDiaries";

export const DiariesView = () => {
  const { uploadedDiaries } = useDiaryDetailStore();
  useFetchDiary();

  return (
    <div className="max-w-4xl mx-auto pt-8">
      {uploadedDiaries.length > 0 ? (
        <div>
          <div className="space-y-4">
            {uploadedDiaries.map((diary, i) => (
              <DiaryPreviewCard key={i} diary={diary} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyDiaries />
      )}
    </div>
  );
};
