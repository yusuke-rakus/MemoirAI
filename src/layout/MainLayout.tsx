import { SidebarProvider } from "@/components/ui/sidebar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { type ReactElement, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

type MainLayoutProps = {
  title?: string | null;
  headerComponent?: ReactElement | null;
  sidebarComponent?: ReactElement | null;
  children: ReactNode;
};

export const MainLayout = (props: MainLayoutProps) => {
  const { title, headerComponent, sidebarComponent, children } = props;

  title && useDocumentTitle(title);

  const header = headerComponent === undefined ? <Header /> : headerComponent;
  const sidebar =
    sidebarComponent === undefined ? <AppSidebar /> : sidebarComponent;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-background w-full">
        {sidebar}
        <main className="flex-1 min-w-0 mt-14 flex flex-col w-full">
          {header}
          <div className="flex-1 w-full overflow-auto">
            <div className="max-w-4xl mx-auto px-2">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
