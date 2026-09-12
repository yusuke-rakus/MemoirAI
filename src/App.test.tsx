import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("./components/shared/common/NotificationToaster", () => ({
  NotificationToaster: () => null,
}));

vi.mock("./features/createDiary", () => ({
  NewDiaryPage: () => <div>new diary page</div>,
}));

vi.mock("./features/diaries", () => ({
  DiariesPage: () => <div>diaries page</div>,
}));

vi.mock("./features/home", () => ({
  HomePage: () => <div>home page</div>,
}));

vi.mock("./features/legal", () => ({
  LegacyLegalRedirect: () => <div>legacy legal redirect</div>,
  LegalPage: () => <div>legal page</div>,
}));

vi.mock("./features/login", () => ({
  LoginPage: () => <div>login page</div>,
}));

vi.mock("./features/sharedDiary", () => ({
  SharedDiaryPage: () => <div>shared diary page</div>,
}));

vi.mock("./layout/AppShellLayout", () => ({
  AppShellLayout: Outlet,
}));

vi.mock("./layout/AuthenticatedLayout", () => ({
  AuthenticatedLayout: Outlet,
}));

describe("App", () => {
  it("存在しないURLでは404ページを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/this-page-does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "ページが見つかりません" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "ホームへ戻る" })).toHaveAttribute(
      "href",
      "/calendar",
    );
    expect(
      screen.getByRole("link", { name: "ログイン画面へ" }),
    ).toHaveAttribute("href", "/login");
  });
});
