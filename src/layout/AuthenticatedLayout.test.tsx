import { render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { AppShellOutletContext } from "./AppShellLayout";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

const renderLayout = (user: User | null) =>
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route
          element={
            <Outlet context={{ user } satisfies AppShellOutletContext} />
          }
        >
          <Route element={<AuthenticatedLayout />}>
            <Route path="/private" element={<div>private-page</div>} />
          </Route>
        </Route>
        <Route path="/login" element={<div>login-page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("AuthenticatedLayout", () => {
  it("認証済みでは子routeを表示する", () => {
    renderLayout({ uid: "user-1" } as User);

    expect(screen.getByText("private-page")).toBeInTheDocument();
  });

  it("未認証ではloginへredirectする", () => {
    renderLayout(null);

    expect(screen.getByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("private-page")).not.toBeInTheDocument();
  });
});
