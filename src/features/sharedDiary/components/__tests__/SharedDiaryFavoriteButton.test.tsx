import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FavoriteMutationResult } from "../../hooks/useSharedDiaryFavorite";
import { SharedDiaryFavoriteButton } from "../SharedDiaryFavoriteButton";

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
  it("登録済みでは解除操作と選択状態を表示する", () => {
    render(<FavoriteButtonHarness initialFavorite />);
    expect(
      screen.getByRole("button", { name: "お気に入りから削除" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("追加操作を通知し、登録成功後に選択状態を反映する", async () => {
    toggleFavoriteMock.mockResolvedValue("added");
    render(<FavoriteButtonHarness />);
    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));
    expect(
      await screen.findByRole("button", { name: "お気に入りから削除" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(toggleFavoriteMock).toHaveBeenCalledOnce();
  });

  it("解除操作を通知し、解除成功後に未選択状態を反映する", async () => {
    toggleFavoriteMock.mockResolvedValue("removed");
    render(<FavoriteButtonHarness initialFavorite />);
    fireEvent.click(screen.getByRole("button", { name: "お気に入りから削除" }));
    expect(
      await screen.findByRole("button", { name: "お気に入りに追加" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(toggleFavoriteMock).toHaveBeenCalledOnce();
  });

  it("更新が成功しなかった場合は未選択状態を維持する", async () => {
    render(<FavoriteButtonHarness />);
    fireEvent.click(screen.getByRole("button", { name: "お気に入りに追加" }));
    await waitFor(() => expect(toggleFavoriteMock).toHaveBeenCalledOnce());
    expect(
      screen.getByRole("button", { name: "お気に入りに追加" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("状態確認中と更新中は操作を無効化する", () => {
    const { rerender } = render(<FavoriteButtonHarness isLoading />);
    const loadingButton = screen.getByRole("button", {
      name: "お気に入りに追加",
    });
    expect(loadingButton).toBeDisabled();
    fireEvent.click(loadingButton);
    expect(toggleFavoriteMock).not.toHaveBeenCalled();

    rerender(<FavoriteButtonHarness isMutating />);
    const mutatingButton = screen.getByRole("button", {
      name: "お気に入りに追加",
    });
    expect(mutatingButton).toBeDisabled();
    fireEvent.click(mutatingButton);
    expect(toggleFavoriteMock).not.toHaveBeenCalled();
  });
});
