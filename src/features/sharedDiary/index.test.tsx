import { render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AppShellOutletContext } from "@/layout/AppShellLayout";
import { SharedDiaryPage } from ".";

vi.mock("@/features/login/components/LoginHeader", () => ({
  LoginHeader: () => <div>login-header</div>,
}));

vi.mock("@/hooks/useDocumentTitle", () => ({
  useDocumentTitle: vi.fn(),
}));

vi.mock("@/layout/MainLayout", () => ({
  MainLayout: ({
    headerComponent,
    sidebarComponent,
    children,
  }: {
    headerComponent?: ReactElement | null;
    sidebarComponent?: ReactElement | null;
    children: ReactNode;
  }) => (
    <div data-testid="main-layout">
      <div data-testid="header-slot">
        {headerComponent === undefined ? "default-header" : headerComponent}
      </div>
      <div data-testid="sidebar-slot">
        {sidebarComponent === undefined
          ? "default-sidebar"
          : (sidebarComponent ?? "no-sidebar")}
      </div>
      {children}
    </div>
  ),
}));

vi.mock("./components/SharedDiaryView", () => ({
  SharedDiaryView: ({
    authenticatedUserId,
  }: {
    authenticatedUserId?: string | null;
  }) => (
    <div data-testid="shared-diary-view" data-user-id={authenticatedUserId} />
  ),
}));

const renderPage = (user: User | null) =>
  render(
    <MemoryRouter initialEntries={["/shared/diary-1"]}>
      <Routes>
        <Route
          element={
            <Outlet context={{ user } satisfies AppShellOutletContext} />
          }
        >
          <Route path="/shared/:diaryId" element={<SharedDiaryPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("SharedDiaryPage", () => {
  it("認証済みでは親の標準shellを再生成せずUIDをViewへ渡す", () => {
    renderPage({ uid: "user-1" } as User);

    expect(screen.queryByTestId("main-layout")).not.toBeInTheDocument();
    expect(screen.getByTestId("shared-diary-view")).toHaveAttribute(
      "data-user-id",
      "user-1",
    );
  });

  it("未認証ではLoginHeaderを表示してSidebarを描画しない", () => {
    renderPage(null);

    expect(screen.getByTestId("header-slot")).toHaveTextContent("login-header");
    expect(screen.getByTestId("sidebar-slot")).toHaveTextContent("no-sidebar");
    expect(screen.getByTestId("shared-diary-view")).not.toHaveAttribute(
      "data-user-id",
    );
  });
});
