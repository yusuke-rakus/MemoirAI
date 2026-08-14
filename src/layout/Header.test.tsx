import { useSidebar } from "@/components/ui/sidebar";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: vi.fn(),
}));

vi.mock("@/stores/diarySearchStore", () => ({
  useDiarySearchStore: <T,>(selector: (state: { setOpen: () => void }) => T) =>
    selector({ setOpen: vi.fn() }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
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

describe("Header", () => {
  it("モバイルでは48px高のアプリバーに3つの操作を表示する", () => {
    mockedUseSidebar.mockReturnValue({
      state: "collapsed",
      open: true,
      setOpen: vi.fn(),
      isMobile: true,
      openMobile: false,
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole("banner")).toHaveClass("h-12");
    expect(screen.getByText("MemoirAI")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ナビゲーションを開く" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "日記を検索" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新しい日記を書く" }),
    ).toBeInTheDocument();
  });

  it("デスクトップでサイドバーが開いている時は描画しない", () => {
    const { container } = render(<Header />);

    expect(container).toBeEmptyDOMElement();
  });

  it("デスクトップでサイドバーが閉じている時は小型操作群を表示する", () => {
    mockedUseSidebar.mockReturnValue({
      state: "collapsed",
      open: false,
      setOpen: vi.fn(),
      isMobile: false,
      openMobile: false,
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    });

    render(<Header />);

    const toolbar = screen.getByRole("toolbar", { name: "ページ操作" });
    expect(
      within(toolbar).getByRole("button", {
        name: "ナビゲーションを開く",
      }),
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "日記を検索" }),
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", {
        name: "新しい日記を書く",
      }),
    ).toBeInTheDocument();
  });
});
