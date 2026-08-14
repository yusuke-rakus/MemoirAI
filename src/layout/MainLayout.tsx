import { SidebarProvider } from "@/components/ui/sidebar";
import { DiarySearchDialog } from "@/features/searchDiary/components/DiarySearchDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
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

  useDocumentTitle(title);

  const header = headerComponent === undefined ? <Header /> : headerComponent;
  const sidebar =
    sidebarComponent === undefined ? <AppSidebar /> : sidebarComponent;
  const hasDefaultHeader = headerComponent === undefined;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-background">
        {sidebar}
        <main
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col",
            hasDefaultHeader
              ? "mt-12 transition-[padding] duration-200 ease-linear md:mt-0 md:peer-data-[state=collapsed]:pl-14"
              : "mt-14",
          )}
        >
          {header}
          <div className="w-full flex-1 overflow-auto">
            <div className="mx-auto max-w-4xl px-2">{children}</div>
          </div>
        </main>
        <DiarySearchDialog />
      </div>
    </SidebarProvider>
  );
};
