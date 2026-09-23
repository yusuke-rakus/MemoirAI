import { MainLayout } from "@/layout/MainLayout";

import { LoginHeader } from "./components/LoginHeader";
import { LoginView } from "./components/LoginView";

export const LoginPage = () => {
  return (
    <MainLayout
      title="ログイン"
      headerComponent={<LoginHeader />}
      headerOffsetClassName="mt-14"
      sidebarComponent={null}
    >
      <LoginView />
    </MainLayout>
  );
};
