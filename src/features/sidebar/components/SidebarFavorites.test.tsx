import { useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetchFavoriteDiaries } from "../hooks/useFetchFavoriteDiaries";
import { SidebarFavorites } from "./SidebarFavorites";

vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => children,
  SidebarMenuButton: ({
    asChild,
    children,
    ...props
  }: {
    asChild?: boolean;
    children: ReactElement | ReactNode;
  }) =>
    asChild ? (
      children
    ) : (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuSkeleton: () => <div>loading-skeleton</div>,
  SidebarMenuSub: ({ children, ...props }: { children: ReactNode }) => (
    <ul {...props}>{children}</ul>
  ),
  SidebarMenuSubItem: ({ children }: { children: ReactNode }) => (
    <li>{children}</li>
  ),
  useSidebar: vi.fn(),
}));

vi.mock("../hooks/useFetchFavoriteDiaries", () => ({
  useFetchFavoriteDiaries: vi.fn(),
}));

const useSidebarMock = vi.mocked(useSidebar);
const useFetchFavoriteDiariesMock = vi.mocked(useFetchFavoriteDiaries);
const setOpenMobileMock = vi.fn();
const loadMoreMock = vi.fn();

const favoriteState = {
  favoriteDiaries: [{ sharedDiaryId: "shared-1", title: "お気に入りの日記" }],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  loadMore: loadMoreMock,
};

beforeEach(() => {
  useSidebarMock.mockReturnValue({
    state: "expanded",
    open: true,
    setOpen: vi.fn(),
    isMobile: false,
    openMobile: false,
    setOpenMobile: setOpenMobileMock,
    toggleSidebar: vi.fn(),
  });
  useFetchFavoriteDiariesMock.mockReturnValue(favoriteState);
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SidebarFavorites />
    </MemoryRouter>,
  );

describe("SidebarFavorites", () => {
  it("初期状態では閉じていてfavoriteを描画しない", () => {
    renderComponent();

    expect(screen.getByRole("button", { name: "お気に入り" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(useFetchFavoriteDiariesMock).toHaveBeenCalledWith(false);
    expect(screen.queryByText("お気に入りの日記")).not.toBeInTheDocument();
  });

  it("展開するとfavoriteと共有日記へのリンクを表示する", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "お気に入り" }));

    expect(screen.getByRole("button", { name: "お気に入り" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(useFetchFavoriteDiariesMock).toHaveBeenLastCalledWith(true);
    expect(
      screen.getByRole("link", { name: "お気に入りの日記" }),
    ).toHaveAttribute("href", "/shared/shared-1");
  });

  it("loadingとempty状態を表示する", () => {
    useFetchFavoriteDiariesMock.mockReturnValue({
      ...favoriteState,
      favoriteDiaries: [],
      isLoading: true,
    });
    const { unmount } = renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "お気に入り" }));
    expect(screen.getAllByText("loading-skeleton")).toHaveLength(5);
    unmount();

    useFetchFavoriteDiariesMock.mockReturnValue({
      ...favoriteState,
      favoriteDiaries: [],
    });
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "お気に入り" }));
    expect(screen.getByText("お気に入りはありません")).toBeInTheDocument();
  });

  it("さらに10件表示から追加取得する", () => {
    useFetchFavoriteDiariesMock.mockReturnValue({
      ...favoriteState,
      hasMore: true,
    });
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "お気に入り" }));

    fireEvent.click(screen.getByRole("button", { name: "さらに10件表示" }));

    expect(loadMoreMock).toHaveBeenCalledOnce();
  });

  it("モバイルではfavorite遷移時にSidebarを閉じる", () => {
    useSidebarMock.mockReturnValue({
      state: "expanded",
      open: true,
      setOpen: vi.fn(),
      isMobile: true,
      openMobile: true,
      setOpenMobile: setOpenMobileMock,
      toggleSidebar: vi.fn(),
    });
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "お気に入り" }));

    fireEvent.click(screen.getByRole("link", { name: "お気に入りの日記" }));

    expect(setOpenMobileMock).toHaveBeenCalledWith(false);
  });
});
