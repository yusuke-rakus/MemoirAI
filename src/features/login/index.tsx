import { MainLayout } from "@/layout/MainLayout";
import { LoginView } from "./components/LoginView";
import { LoginHeader } from "./components/LoginHeader";

export const LoginPage = () => {
  return (
    <MainLayout
      title="login"
      headerComponent={<LoginHeader />}
      sidebarComponent={null}
    >
      <LoginView />
    </MainLayout>
  );
};
