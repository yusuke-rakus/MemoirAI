import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FavoriteMutationResult } from "../hooks/useSharedDiaryFavorite";
import { SharedDiaryFavoriteButton } from "./SharedDiaryFavoriteButton";

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();

  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

const useReducedMotionMock = vi.mocked(useReducedMotion);
const toggleFavoriteMock = vi.fn<() => Promise<FavoriteMutationResult>>();

type FavoriteButtonHarnessProps = {
  initialFavorite?: boolean;
  isLoading?: boolean;
  isMutating?: boolean;
  isAvailable?: boolean;
};

const FavoriteButtonHarness = ({
  initialFavorite = false,
  isLoading = false,
  isMutating = false,
  isAvailable = true,
}: FavoriteButtonHarnessProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = async () => {
    const result = await toggleFavoriteMock();

    if (result === "added") {
      setIsFavorite(true);
    } else if (result === "removed") {
      setIsFavorite(false);
    }

    return result;
  };

  return (
    <SharedDiaryFavoriteButton
      isFavorite={isFavorite}
      isLoading={isLoading}
      isMutating={isMutating}
      isAvailable={isAvailable}
      toggleFavorite={toggleFavorite}
    />
  );
};

beforeEach(() => {
  useReducedMotionMock.mockReturnValue(false);
  toggleFavoriteMock.mockResolvedValue(null);
});

describe("SharedDiaryFavoriteButton", () => {
  it("登録済みの初期表示では赤いハートを通常サイズで表示してburstしない", () => {
    render(<FavoriteButtonHarness initialFavorite />);

    const button = screen.getByRole("button", {
      name: "お気に入りから削除",
    });
    const heart = button.querySelector('[data-slot="favorite-heart"]');

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector("svg")).toHaveClass(
      "fill-favorite",
      "text-favorite",
    );
    expect(heart).toHaveAttribute("data-animation", "idle");
    expect(heart).toHaveStyle({ transform: "none" });
    expect(
      button.querySelector('[data-slot="favorite-burst"]'),
    ).not.toBeInTheDocument();
  });

  it("登録成功後にring、8個のparticle、heart bounceを開始する", async () => {
    toggleFavoriteMock.mockResolvedValue("added");
    render(<FavoriteButtonHarness />);

    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));

    const button = await screen.findByRole("button", {
      name: "お気に入りから削除",
    });
    await waitFor(() =>
      expect(
        button.querySelector('[data-slot="favorite-burst"]'),
      ).toBeInTheDocument(),
    );

    expect(
      button.querySelector('[data-slot="favorite-burst-ring"]'),
    ).toBeInTheDocument();
    expect(
      button.querySelectorAll('[data-slot="favorite-burst-particle"]'),
    ).toHaveLength(8);
    expect(
      button.querySelector('[data-slot="favorite-heart"]'),
    ).toHaveAttribute("data-animation", "added");
    expect(button.querySelector("svg")).toHaveClass(
      "fill-favorite",
      "text-favorite",
    );
  });

  it("解除成功後はburstせずheartの縮小アニメーションだけを開始する", async () => {
    toggleFavoriteMock.mockResolvedValue("removed");
    render(<FavoriteButtonHarness initialFavorite />);

    fireEvent.click(screen.getByRole("button", { name: "お気に入りから削除" }));

    const button = await screen.findByRole("button", {
      name: "お気に入りに追加",
    });

    expect(
      button.querySelector('[data-slot="favorite-burst"]'),
    ).not.toBeInTheDocument();
    expect(
      button.querySelector('[data-slot="favorite-heart"]'),
    ).toHaveAttribute("data-animation", "removed");
    expect(button.querySelector("svg")).toHaveClass(
      "fill-transparent",
      "text-muted-foreground",
    );
  });

  it("更新失敗時は表示とアニメーションを変更しない", async () => {
    render(<FavoriteButtonHarness />);

    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));

    await waitFor(() => expect(toggleFavoriteMock).toHaveBeenCalledOnce());

    const button = screen.getByRole("button", { name: "お気に入りに追加" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(
      button.querySelector('[data-slot="favorite-heart"]'),
    ).toHaveAttribute("data-animation", "idle");
    expect(
      button.querySelector('[data-slot="favorite-burst"]'),
    ).not.toBeInTheDocument();
  });

  it("reduced motionでは登録成功後も装飾アニメーションを表示しない", async () => {
    useReducedMotionMock.mockReturnValue(true);
    toggleFavoriteMock.mockResolvedValue("added");
    render(<FavoriteButtonHarness />);

    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));

    const button = await screen.findByRole("button", {
      name: "お気に入りから削除",
    });

    expect(
      button.querySelector('[data-slot="favorite-burst"]'),
    ).not.toBeInTheDocument();
    expect(button.querySelector('[data-slot="favorite-heart"]')).toHaveStyle({
      transform: "none",
    });
  });

  it("状態確認中と更新中はheartを表示したままボタンを無効化する", () => {
    const { rerender } = render(<FavoriteButtonHarness isLoading />);

    const loadingButton = screen.getByRole("button", {
      name: "お気に入りに追加",
    });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton.querySelector("svg")).toBeInTheDocument();
    expect(
      loadingButton.querySelector(".animate-spin"),
    ).not.toBeInTheDocument();

    rerender(<FavoriteButtonHarness isMutating />);

    const mutatingButton = screen.getByRole("button", {
      name: "お気に入りに追加",
    });
    expect(mutatingButton).toBeDisabled();
    expect(mutatingButton.querySelector("svg")).toBeInTheDocument();
    expect(
      mutatingButton.querySelector(".animate-spin"),
    ).not.toBeInTheDocument();
  });
});
