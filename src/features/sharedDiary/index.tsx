import { LoginHeader } from "@/features/login/components/LoginHeader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { AppShellOutletContext } from "@/layout/AppShellLayout";
import { MainLayout } from "@/layout/MainLayout";
import { useOutletContext } from "react-router-dom";
import { SharedDiaryView } from "./components/SharedDiaryView";

export const SharedDiaryPage = () => {
  const { user } = useOutletContext<AppShellOutletContext>();
  useDocumentTitle("共有された日記");

  const sharedDiaryView = <SharedDiaryView authenticatedUserId={user?.uid} />;

  if (user) {
    return sharedDiaryView;
  }

  return (
    <MainLayout headerComponent={<LoginHeader />} sidebarComponent={null}>
      {sharedDiaryView}
    </MainLayout>
  );
};
