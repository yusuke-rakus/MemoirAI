import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SidebarDiaries } from "./SidebarDiaries";

vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuSkeleton: () => null,
  SidebarMenuSub: ({ children }: { children: ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuSubItem: ({ children }: { children: ReactNode }) => (
    <li>{children}</li>
  ),
  useSidebar: () => ({
    isMobile: false,
    setOpenMobile: vi.fn(),
  }),
}));

vi.mock("../hooks/useFetchDiary", () => ({
  useFetchDiary: () => ({
    loadMore: vi.fn(),
    hasMore: false,
    isLoadingMore: false,
  }),
}));

vi.mock("../provider/DiaryDetailProvider", () => ({
  useDiaryDetailStore: () => ({
    uploadedDiaries: [],
    isLoading: false,
  }),
}));

vi.mock("./SidebarFavorites", () => ({
  SidebarFavorites: () => <div>お気に入りsection</div>,
}));

describe("SidebarDiaries", () => {
  it("favoriteと自分の日記を同じscroll領域へ配置する", () => {
    const { container } = render(<SidebarDiaries />);
    const listRegion = container.firstElementChild;

    expect(listRegion).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(listRegion).toContainElement(screen.getByText("お気に入りsection"));
    expect(listRegion).toContainElement(screen.getByText("日記の一覧"));
  });
});
