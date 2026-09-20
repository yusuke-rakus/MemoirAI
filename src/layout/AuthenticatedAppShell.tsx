import { type ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { MainLayout } from "./MainLayout";

type AuthenticatedAppShellProps = {
  children: ReactNode;
};

const AuthenticatedAppShell = ({ children }: AuthenticatedAppShellProps) => (
  <MainLayout headerComponent={<Header />} sidebarComponent={<AppSidebar />}>
    {children}
  </MainLayout>
);

export default AuthenticatedAppShell;
