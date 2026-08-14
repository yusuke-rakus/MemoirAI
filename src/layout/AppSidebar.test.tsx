import { useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./AppSidebar";

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
  SidebarContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  ),
  useSidebar: vi.fn(),
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
