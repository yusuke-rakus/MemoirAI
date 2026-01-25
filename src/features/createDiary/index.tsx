import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { NewDiaryView } from "./components/NewDiaryView";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const NewDiaryPage = () => {
  const { loading } = useAuthCheck();
  const initialDate = useInitialDiaryDate();

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <DiaryDetailProvider initialDate={initialDate}>
      <MainLayout title="日記の詳細">
        <NewDiaryView />
      </MainLayout>
    </DiaryDetailProvider>
  );
};
