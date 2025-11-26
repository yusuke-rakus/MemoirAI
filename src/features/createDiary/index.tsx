import { MainLayout } from "@/layout/MainLayout";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { NewDiaryView } from "./components/NewDiaryView";

export const NewDiaryPage = () => {
  const { loading } = useAuthCheck();

  return loading ? (
    <h1>Loading...</h1>
  ) : (
    <MainLayout title="About">
      <NewDiaryView />
    </MainLayout>
  );
};
