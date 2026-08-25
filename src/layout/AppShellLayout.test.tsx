import { useLegalAcceptance } from "@/features/legal/hooks/useLegalAcceptance";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useUserInitialization } from "@/hooks/useUserInitialization";
import { fireEvent, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useOutletContext,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShellLayout, type AppShellOutletContext } from "./AppShellLayout";

vi.mock("@/hooks/useAuthCheck", () => ({
  useAuthCheck: vi.fn(),
}));

vi.mock("@/features/legal/hooks/useLegalAcceptance", () => ({
  useLegalAcceptance: vi.fn(),
}));

vi.mock("@/hooks/useUserInitialization", () => ({
  useUserInitialization: vi.fn(),
}));

vi.mock("./MainLayout", () => ({
  MainLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

const useAuthCheckMock = vi.mocked(useAuthCheck);
const useLegalAcceptanceMock = vi.mocked(useLegalAcceptance);
const useUserInitializationMock = vi.mocked(useUserInitialization);

const acceptedLegalState = {
  status: "accepted",
  isSubmitting: false,
  submitError: false,
  accept: vi.fn(),
  retry: vi.fn(),
} satisfies ReturnType<typeof useLegalAcceptance>;

const ContextView = () => {
  const { user } = useOutletContext<AppShellOutletContext>();

  return <div data-testid="outlet-user">{user?.uid ?? "guest"}</div>;
};

const renderShell = () =>
  render(
    <MemoryRouter initialEntries={["/shared/diary-1"]}>
      <Routes>
        <Route element={<AppShellLayout />}>
          <Route path="/shared/:diaryId" element={<ContextView />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  useAuthCheckMock.mockReturnValue({ loading: false, user: null });
  useLegalAcceptanceMock.mockReturnValue(acceptedLegalState);
  useUserInitializationMock.mockReturnValue({
    status: "ready",
    retry: vi.fn(),
  });
});

describe("AppShellLayout", () => {
  it("認証確認中はfull-page loadingだけを表示する", () => {
    useAuthCheckMock.mockReturnValue({ loading: true, user: null });

    renderShell();

    expect(
      screen.getByText("読み込み中...").closest('[role="status"]'),
    ).toHaveClass("h-dvh", "w-screen");
    expect(screen.queryByTestId("main-layout")).not.toBeInTheDocument();
    expect(screen.queryByTestId("outlet-user")).not.toBeInTheDocument();
  });

  it("認証済みでは標準shell内へユーザー付きOutletを描画する", () => {
    useAuthCheckMock.mockReturnValue({
      loading: false,
      user: { uid: "user-1" } as User,
    });

    renderShell();

    expect(screen.getByTestId("main-layout")).toContainElement(
      screen.getByTestId("outlet-user"),
    );
    expect(screen.getByTestId("outlet-user")).toHaveTextContent("user-1");
  });

  it("認証済みでも同意確認中は共通のloadingだけを表示する", () => {
    useAuthCheckMock.mockReturnValue({
      loading: false,
      user: { uid: "user-1" } as User,
    });
    useLegalAcceptanceMock.mockReturnValue({
      ...acceptedLegalState,
      status: "loading",
    });

    renderShell();

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(screen.queryByTestId("outlet-user")).not.toBeInTheDocument();
  });

  it("未同意ユーザーにはapp contentより先に同意gateを表示する", () => {
    useAuthCheckMock.mockReturnValue({
      loading: false,
      user: { uid: "user-1" } as User,
    });
    useLegalAcceptanceMock.mockReturnValue({
      ...acceptedLegalState,
      status: "required",
    });

    renderShell();

    expect(
      screen.getByRole("heading", {
        name: "ご利用前にご確認ください",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("main-layout")).not.toBeInTheDocument();
    expect(screen.queryByTestId("outlet-user")).not.toBeInTheDocument();
  });

  it("同意済みでも利用準備中は共通のloadingだけを表示する", () => {
    useAuthCheckMock.mockReturnValue({
      loading: false,
      user: { uid: "user-1" } as User,
    });
    useUserInitializationMock.mockReturnValue({
      status: "loading",
      retry: vi.fn(),
    });

    renderShell();

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(screen.queryByTestId("outlet-user")).not.toBeInTheDocument();
  });

  it("未認証では標準shellを描画せず公開Outletを表示する", () => {
    renderShell();

    expect(screen.queryByTestId("main-layout")).not.toBeInTheDocument();
    expect(screen.getByTestId("outlet-user")).toHaveTextContent("guest");
  });

  it("認証済みの共有日記から別ページへ移動してもshellを維持する", () => {
    useAuthCheckMock.mockReturnValue({
      loading: false,
      user: { uid: "user-1" } as User,
    });

    render(
      <MemoryRouter initialEntries={["/shared/diary-1"]}>
        <Routes>
          <Route element={<AppShellLayout />}>
            <Route
              path="/shared/:diaryId"
              element={<Link to="/calendar/2026/8">calendarへ</Link>}
            />
            <Route
              path="/calendar/:year/:month"
              element={<div>calendar-page</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const shellBeforeNavigation = screen.getByTestId("main-layout");

    fireEvent.click(screen.getByRole("link", { name: "calendarへ" }));

    expect(screen.getByText("calendar-page")).toBeInTheDocument();
    expect(screen.getByTestId("main-layout")).toBe(shellBeforeNavigation);
  });
});
