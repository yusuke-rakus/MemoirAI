import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import type { User } from "firebase/auth";
import { Outlet } from "react-router-dom";
import { MainLayout } from "./MainLayout";

export type AppShellOutletContext = {
  user: User | null;
};

export const AppShellLayout = () => {
  const { loading, user } = useAuthCheck();

  if (loading) {
    return <LoadingScreen variant="page" />;
  }

  const outlet = <Outlet context={{ user } satisfies AppShellOutletContext} />;

  if (!user) {
    return outlet;
  }

  return <MainLayout>{outlet}</MainLayout>;
};
