import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { DiariesView } from "./components/DiariesView";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";

export const DiariesPage = () => {
  const { loading } = useAuthCheck();
  const initialDate = useInitialDiaryDate();

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <DiaryDetailProvider initialDate={initialDate}>
      <MainLayout title="日記の一覧">
        <DiariesView />
      </MainLayout>
    </DiaryDetailProvider>
  );
};
