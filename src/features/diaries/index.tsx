import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiariesView } from "./components/DiariesView";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const DiariesPage = () => {
  const initialDate = useInitialDiaryDate();
  useDocumentTitle("日記の一覧");

  return (
    <DiaryDetailProvider initialDate={initialDate}>
      <DiariesView />
    </DiaryDetailProvider>
  );
};
