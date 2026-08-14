import { useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./AppSidebar";

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
  SidebarContent: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="sidebar-content" className={className}>
      {children}
    </div>
  ),
  SidebarHeader: ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  ),
  SidebarFooter: ({ children }: { children: ReactNode }) => (
    <footer data-testid="sidebar-footer">{children}</footer>
  ),
  useSidebar: vi.fn(),
}));

vi.mock("@/components/shared/header/SettingsDialog", () => ({
  SettingsDialog: () => null,
}));

vi.mock("@/contexts/LocalUserContext", () => ({
  defaultLocalUser: {
    uid: "",
    displayName: null,
    photoURL: null,
  },
  useLocalUser: () => ({
    localUser: {
      uid: "user-1",
      displayName: "テスト ユーザー",
      photoURL: null,
    },
    setLocalUser: vi.fn(),
  }),
}));

vi.mock("@/hooks/usePrimaryColor", () => ({
  clearPrimaryColorOverrides: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  signOut: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/features/sidebar", () => ({
  DiaryItems: () => null,
}));

vi.mock("@/features/sidebar/components/SidebarCreateDiaryButton", () => ({
  SidebarCreateDiaryButton: () => <button type="button">新しい日記</button>,
}));

vi.mock("@/features/sidebar/components/SidebarNavigation", () => ({
  SidebarNavigation: () => null,
}));

const mockedUseSidebar = vi.mocked(useSidebar);

beforeEach(() => {
  mockedUseSidebar.mockReturnValue({
    state: "expanded",
    open: true,
    setOpen: vi.fn(),
    isMobile: false,
    openMobile: false,
    setOpenMobile: vi.fn(),
    toggleSidebar: vi.fn(),
  });
});

describe("AppSidebar", () => {
  it("日記一覧以外のコンテンツ領域はスクロールしない", () => {
    render(<AppSidebar />);

    expect(screen.getByTestId("sidebar-content")).toHaveClass(
      "overflow-hidden",
    );
  });

  it("アカウントメニューをサイドバーフッターに表示する", () => {
    render(<AppSidebar />);

    expect(
      within(screen.getByTestId("sidebar-footer")).getByRole("button", {
        name: "アカウントメニューを開く",
      }),
    ).toBeInTheDocument();
  });

  it("閉じるボタンへのフォーカスではツールチップを表示せず、ホバー時に表示する", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const user = userEvent.setup();

    render(<AppSidebar />);
    const closeButton = screen.getByRole("button", {
      name: "ナビゲーションを閉じる",
    });

    fireEvent.focus(closeButton);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(closeButton);

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "サイドバーを閉じる",
    );
  });
});
