import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SharedDiary } from "@/types/diary/sharedDiary";

import { useSharedDiary } from "../../hooks/useSharedDiary";
import { useSharedDiaryFavorite } from "../../hooks/useSharedDiaryFavorite";
import { SharedDiaryView } from "../SharedDiaryView";

vi.mock("../../hooks/useSharedDiary", () => ({
  useSharedDiary: vi.fn(),
}));

vi.mock("../../hooks/useSharedDiaryFavorite", () => ({
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
  createdAt: {
    toDate: () => new Date(2020, 0, 1),
  } as SharedDiary["createdAt"],
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
  it("共有日記の本文をMarkdownで表示する", () => {
    useSharedDiaryMock.mockReturnValue({
      diary: {
        ...diary,
        content: "## 海辺の記録\n\n**忘れたくない景色**だった。",
      },
      sharedDiaryId: "shared-diary-1",
      isLoading: false,
    });

    render(<SharedDiaryView authenticatedUserId={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "海辺の記録" }),
    ).toBeInTheDocument();
    expect(screen.getByText("忘れたくない景色").tagName).toBe("STRONG");
  });

  it("未認証時はお気に入りボタンを表示しない", () => {
    render(<SharedDiaryView authenticatedUserId={null} />);

    expect(
      screen.queryByRole("button", { name: /お気に入り/ }),
    ).not.toBeInTheDocument();
  });

  it("登録済みのお気に入りを解除する操作を通知する", () => {
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
    fireEvent.click(button);

    expect(toggleFavoriteMock).toHaveBeenCalledOnce();
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

    useSharedDiaryFavoriteMock.mockReturnValue({
      ...favoriteState,
      isMutating: true,
    });
    rerender(<SharedDiaryView authenticatedUserId="user-1" />);

    expect(
      screen.getByRole("button", { name: "お気に入りに追加" }),
    ).toBeDisabled();
  });
});
