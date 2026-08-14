import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MainLayout } from "./MainLayout";

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/searchDiary/components/DiarySearchDialog", () => ({
  DiarySearchDialog: () => null,
}));

vi.mock("@/hooks/useDocumentTitle", () => ({
  useDocumentTitle: vi.fn(),
}));

vi.mock("./AppSidebar", () => ({
  AppSidebar: () => <aside />,
}));

vi.mock("./Header", () => ({
  Header: () => <header />,
}));

describe("MainLayout", () => {
  it("標準レイアウトではモバイル用の48px上部余白と閉鎖時の左余白を使う", () => {
    render(<MainLayout>content</MainLayout>);

    expect(screen.getByRole("main")).toHaveClass(
      "mt-12",
      "md:mt-0",
      "md:peer-data-[state=collapsed]:pl-14",
    );
  });

  it("カスタムヘッダーでは既存の56px上部余白を維持する", () => {
    render(
      <MainLayout headerComponent={<header />} sidebarComponent={null}>
        content
      </MainLayout>,
    );

    expect(screen.getByRole("main")).toHaveClass("mt-14");
    expect(screen.getByRole("main")).not.toHaveClass("md:mt-0");
  });
});
