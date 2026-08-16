import type { SharedDiary } from "@/types/diary/sharedDiary";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSharedDiary } from "../hooks/useSharedDiary";
import { useSharedDiaryFavorite } from "../hooks/useSharedDiaryFavorite";
import { SharedDiaryView } from "./SharedDiaryView";

vi.mock("../hooks/useSharedDiary", () => ({
  useSharedDiary: vi.fn(),
}));

vi.mock("../hooks/useSharedDiaryFavorite", () => ({
  useSharedDiaryFavorite: vi.fn(),
}));

const useSharedDiaryMock = vi.mocked(useSharedDiary);
const useSharedDiaryFavoriteMock = vi.mocked(useSharedDiaryFavorite);
const toggleFavoriteMock = vi.fn().mockResolvedValue(null);

const diary: SharedDiary = {
  id: "source-diary-1",
  uid: "owner-1",
  date: {
    toDate: () => new Date(2026, 7, 15),
  } as SharedDiary["date"],
  title: "夏の思い出",
  content: "海へ行きました。",
  tags: [],
  createdAt: {} as SharedDiary["createdAt"],
  sharedAt: {} as SharedDiary["sharedAt"],
};

const favoriteState = {
  isFavorite: false,
  isLoading: false,
  isMutating: false,
  isAvailable: true,
  toggleFavorite: toggleFavoriteMock,
};

beforeEach(() => {
  useSharedDiaryMock.mockReturnValue({
    diary,
    sharedDiaryId: "shared-diary-1",
    isLoading: false,
  });
  useSharedDiaryFavoriteMock.mockReturnValue(favoriteState);
});

describe("SharedDiaryView favorite", () => {
  it("未認証時はお気に入りボタンを表示しない", () => {
    render(<SharedDiaryView authenticatedUserId={null} />);

    expect(
      screen.queryByRole("button", { name: /お気に入り/ }),
    ).not.toBeInTheDocument();
  });

  it("カード右下にactive色のハートを通常サイズで表示し、ホバーでツールチップを開く", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const user = userEvent.setup();
    useSharedDiaryFavoriteMock.mockReturnValue({
      ...favoriteState,
      isFavorite: true,
    });
    render(<SharedDiaryView authenticatedUserId="user-1" />);

    const button = screen.getByRole("button", {
      name: "お気に入りから削除",
    });
    expect(useSharedDiaryFavoriteMock).toHaveBeenCalledWith({
      uid: "user-1",
      sharedDiaryId: "shared-diary-1",
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("ml-auto");
    expect(button.closest('[data-slot="card-footer"]')).toBeInTheDocument();
    expect(button.querySelector("svg")).toHaveClass(
      "fill-favorite",
      "text-favorite",
      "transition-colors",
      "duration-200",
      "motion-reduce:transition-none",
    );
    expect(button.querySelector("svg")?.parentElement).toHaveStyle({
      transform: "none",
    });

    await user.hover(button);

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "お気に入りから削除",
    );

    fireEvent.click(button);

    expect(toggleFavoriteMock).toHaveBeenCalledOnce();
  });

  it("未登録時はハートをグレーで表示する", () => {
    render(<SharedDiaryView authenticatedUserId="user-1" />);

    const button = screen.getByRole("button", {
      name: "お気に入りに追加",
    });
    const icon = button.querySelector("svg");

    expect(icon).toHaveClass("text-muted-foreground");
    expect(icon).toHaveClass("fill-transparent");
    expect(icon).not.toHaveClass("fill-favorite", "text-favorite");
    expect(icon?.parentElement).toHaveStyle({ transform: "none" });
  });

  it("状態確認中と更新中はボタンを無効化する", () => {
    useSharedDiaryFavoriteMock.mockReturnValue({
      ...favoriteState,
      isLoading: true,
    });
    const { rerender } = render(
      <SharedDiaryView authenticatedUserId="user-1" />,
    );

    expect(
      screen.getByRole("button", { name: "お気に入りに追加" }),
    ).toBeDisabled();
    expect(
      screen
        .getByRole("button", { name: "お気に入りに追加" })
        .querySelector("svg"),
    ).toHaveClass("text-muted-foreground");
    expect(
      screen
        .getByRole("button", { name: "お気に入りに追加" })
        .querySelector("svg"),
    ).not.toHaveClass("animate-spin");

    useSharedDiaryFavoriteMock.mockReturnValue({
      ...favoriteState,
      isMutating: true,
    });
    rerender(<SharedDiaryView authenticatedUserId="user-1" />);

    expect(
      screen.getByRole("button", { name: "お気に入りに追加" }),
    ).toBeDisabled();
    expect(
      screen
        .getByRole("button", { name: "お気に入りに追加" })
        .querySelector("svg"),
    ).toHaveClass("text-muted-foreground");
    expect(
      screen
        .getByRole("button", { name: "お気に入りに追加" })
        .querySelector("svg"),
    ).not.toHaveClass("animate-spin");
  });
});
