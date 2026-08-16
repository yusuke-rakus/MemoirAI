import { PATHS } from "@/constants/path";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import type { AppShellOutletContext } from "./AppShellLayout";

export const AuthenticatedLayout = () => {
  const { user } = useOutletContext<AppShellOutletContext>();

  if (!user) {
    return <Navigate to={PATHS.login.path} replace />;
  }

  return <Outlet />;
};
