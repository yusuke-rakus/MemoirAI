import { type ReactElement, type ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";

type MainLayoutProps = {
  title?: string | null;
  headerComponent: ReactElement | null;
  sidebarComponent: ReactElement | null;
  children: ReactNode;
};

export const MainLayout = (props: MainLayoutProps) => {
  const { title, headerComponent, sidebarComponent, children } = props;

  useDocumentTitle(title);

  const hasHeader = headerComponent !== null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-background">
        {sidebarComponent}
        <main
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col",
            hasHeader
              ? "mt-12 transition-[padding] duration-200 ease-linear md:mt-0 md:peer-data-[state=collapsed]:pl-14"
              : "mt-14",
          )}
        >
          {headerComponent}
          <div className="w-full flex-1 overflow-auto">
            <div className="mx-auto max-w-4xl px-2">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
