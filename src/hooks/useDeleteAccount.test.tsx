import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteAccount } from "./useDeleteAccount";

const mocks = vi.hoisted(() => ({
  deleteCurrentAccount: vi.fn(),
  setLocalUser: vi.fn(),
  navigate: vi.fn(),
  clearPrimaryColorOverrides: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/service/accountDeletionClient", () => ({
  AccountDeletionClient: {
    deleteCurrentAccount: mocks.deleteCurrentAccount,
  },
}));

vi.mock("@/contexts/LocalUserContext", () => ({
  defaultLocalUser: { uid: "", displayName: null, photoURL: null },
  useLocalUser: () => ({ setLocalUser: mocks.setLocalUser }),
}));

vi.mock("@/hooks/usePrimaryColor", () => ({
  clearPrimaryColorOverrides: mocks.clearPrimaryColorOverrides,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

beforeEach(() => {
  mocks.deleteCurrentAccount.mockResolvedValue(undefined);
});

describe("useDeleteAccount", () => {
  it("削除成功後にlocal stateを初期化してログインへ遷移する", async () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() =>
      useDeleteAccount({ uid: "user-1", onDeleted }),
    );

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(mocks.deleteCurrentAccount).toHaveBeenCalledWith("user-1");
    expect(mocks.clearPrimaryColorOverrides).toHaveBeenCalledOnce();
    expect(mocks.setLocalUser).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "" }),
    );
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("アカウントを削除しました");
  });

  it("削除失敗時はlocal stateと画面を維持して再試行可能にする", async () => {
    mocks.deleteCurrentAccount.mockRejectedValueOnce(new Error("failed"));
    const onDeleted = vi.fn();
    const { result } = renderHook(() =>
      useDeleteAccount({ uid: "user-1", onDeleted }),
    );

    act(() => result.current.setDeleteDialogOpen(true));
    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.isDeleting).toBe(false);
    expect(mocks.setLocalUser).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("アカウントを削除できませんでした"),
    );
  });

  it("削除処理中の二重実行を防止する", async () => {
    let finishDeletion: (() => void) | undefined;
    mocks.deleteCurrentAccount.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDeletion = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useDeleteAccount({ uid: "user-1", onDeleted: vi.fn() }),
    );

    let firstDeletion: Promise<void> | undefined;
    await act(async () => {
      firstDeletion = result.current.deleteAccount();
      await result.current.deleteAccount();
    });

    expect(mocks.deleteCurrentAccount).toHaveBeenCalledOnce();

    await act(async () => {
      finishDeletion?.();
      await firstDeletion;
    });
  });
});
