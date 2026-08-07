import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { PATHS } from "@/constants/path";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./MainLayout";

export const AuthenticatedLayout = () => {
  const { loading, user } = useAuthCheck();

  if (loading) {
    return <LoadingScreen variant="page" />;
  }

  if (!user) {
    return <Navigate to={PATHS.login.path} replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
