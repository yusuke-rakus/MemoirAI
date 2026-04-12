import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { MainLayout } from "@/layout/MainLayout";
import { DiariesView } from "./components/DiariesView";
import { useInitialDiaryDate } from "./hooks/useInitialDiaryDate";
import { DiaryDetailProvider } from "./provider/DiaryDetailProvider";

export const DiariesPage = () => {
  const { loading } = useAuthCheck();
  const initialDate = useInitialDiaryDate();

  return loading ? (
    <LoadingScreen variant="page" />
  ) : (
    <DiaryDetailProvider initialDate={initialDate}>
      <MainLayout title="日記の一覧">
        <DiariesView />
      </MainLayout>
    </DiaryDetailProvider>
  );
};
