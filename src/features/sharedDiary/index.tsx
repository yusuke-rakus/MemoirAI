import { LoginHeader } from "@/features/login/components/LoginHeader";
import { MainLayout } from "@/layout/MainLayout";
import { SharedDiaryView } from "./components/SharedDiaryView";

export const SharedDiaryPage = () => {
  return (
    <MainLayout
      title="共有された日記"
      headerComponent={<LoginHeader />}
      sidebarComponent={null}
    >
      <SharedDiaryView />
    </MainLayout>
  );
};
