import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteAccount } from "../useDeleteAccount";

const mocks = vi.hoisted(() => ({
  reauthenticateCurrentAccount: vi.fn(),
  deleteCurrentAccount: vi.fn(),
  clearAllByUid: vi.fn(),
  deleteAllByUid: vi.fn(),
  deleteSharedDiaries: vi.fn(),
  deletePrivateData: vi.fn(),
  retainLegalAcceptances: vi.fn(),
  setLocalUser: vi.fn(),
  navigate: vi.fn(),
  clearPrimaryColorOverrides: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/service/accountDeletionClient", () => ({
  AccountDeletionClient: {
    reauthenticateCurrentAccount: mocks.reauthenticateCurrentAccount,
    deleteCurrentAccount: mocks.deleteCurrentAccount,
  },
}));

vi.mock("@/lib/service/diaryDraftClient", () => ({
  DiaryDraftClient: { clearAllByUid: mocks.clearAllByUid },
}));

vi.mock("@/lib/service/userStorageClient", () => ({
  UserStorageClient: { deleteAllByUid: mocks.deleteAllByUid },
}));

vi.mock("@/lib/service/userAccountDataClient", () => ({
  UserAccountDataClient: {
    deleteSharedDiaries: mocks.deleteSharedDiaries,
    deletePrivateData: mocks.deletePrivateData,
    retainLegalAcceptances: mocks.retainLegalAcceptances,
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
  vi.clearAllMocks();
  mocks.reauthenticateCurrentAccount.mockResolvedValue(undefined);
  mocks.deleteCurrentAccount.mockResolvedValue(undefined);
  mocks.clearAllByUid.mockResolvedValue(undefined);
  mocks.deleteAllByUid.mockResolvedValue(undefined);
  mocks.deleteSharedDiaries.mockResolvedValue(undefined);
  mocks.deletePrivateData.mockResolvedValue(undefined);
  mocks.retainLegalAcceptances.mockResolvedValue(undefined);
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

    expect(mocks.reauthenticateCurrentAccount).toHaveBeenCalledWith("user-1");
    expect(mocks.clearAllByUid).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteAllByUid).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteSharedDiaries).toHaveBeenCalledWith("user-1");
    expect(mocks.deletePrivateData).toHaveBeenCalledWith("user-1");
    expect(mocks.retainLegalAcceptances).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteCurrentAccount).toHaveBeenCalledWith("user-1");
    expect(
      mocks.reauthenticateCurrentAccount.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.clearAllByUid.mock.invocationCallOrder[0]);
    expect(
      mocks.retainLegalAcceptances.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.deleteCurrentAccount.mock.invocationCallOrder[0]);
    expect(mocks.clearPrimaryColorOverrides).toHaveBeenCalledOnce();
    expect(mocks.setLocalUser).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "" }),
    );
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("アカウントを削除しました");
  });

  it("削除失敗時はlocal stateと画面を維持して再試行可能にする", async () => {
    mocks.deletePrivateData.mockRejectedValueOnce(new Error("failed"));
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
    expect(mocks.deleteCurrentAccount).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("アカウントを削除できませんでした"),
    );
  });

  it("削除処理中の二重実行を防止する", async () => {
    let finishDeletion: (() => void) | undefined;
    mocks.reauthenticateCurrentAccount.mockImplementationOnce(
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

    expect(mocks.reauthenticateCurrentAccount).toHaveBeenCalledOnce();

    await act(async () => {
      finishDeletion?.();
      await firstDeletion;
    });
  });
});
