import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { NewDiaryView } from "./components/NewDiaryView";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const NewDiaryPage = () => {
  const initialDate = useInitialDiaryDate();
  useDocumentTitle("日記の詳細");

  return (
    <DiaryDetailProvider initialDate={initialDate}>
      <NewDiaryView />
    </DiaryDetailProvider>
  );
};
