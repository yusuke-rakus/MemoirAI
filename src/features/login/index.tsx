import { MainLayout } from "@/layout/MainLayout";
import { LoginHeader } from "./components/LoginHeader";
import { LoginView } from "./components/LoginView";

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
