import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountDeletionClient } from "../accountDeletionClient";

const mocks = vi.hoisted(() => ({
  auth: {
    currentUser: { uid: "user-1" } as { uid: string } | null,
  },
  deleteUser: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  auth: mocks.auth,
  provider: { providerId: "google.com" },
}));

vi.mock("firebase/auth", () => ({
  deleteUser: mocks.deleteUser,
  reauthenticateWithPopup: mocks.reauthenticateWithPopup,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.currentUser = { uid: "user-1" };
  mocks.reauthenticateWithPopup.mockResolvedValue({
    user: mocks.auth.currentUser,
  });
});

describe("AccountDeletionClient", () => {
  it("現在のユーザーを再認証する", async () => {
    await AccountDeletionClient.reauthenticateCurrentAccount("user-1");

    expect(mocks.reauthenticateWithPopup).toHaveBeenCalledWith(
      mocks.auth.currentUser,
      { providerId: "google.com" },
    );
  });

  it("現在のユーザーを削除する", async () => {
    await AccountDeletionClient.deleteCurrentAccount("user-1");

    expect(mocks.deleteUser).toHaveBeenCalledWith(mocks.auth.currentUser);
  });

  it("ログイン中のUIDが一致しない場合は何も削除しない", async () => {
    mocks.auth.currentUser = { uid: "another-user" };

    await expect(
      AccountDeletionClient.reauthenticateCurrentAccount("user-1"),
    ).rejects.toThrowError(
      "Authenticated user does not match the requested account.",
    );

    expect(mocks.reauthenticateWithPopup).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("再認証したUIDが一致しない場合はデータを削除しない", async () => {
    mocks.reauthenticateWithPopup.mockResolvedValueOnce({
      user: { uid: "another-user" },
    });

    await expect(
      AccountDeletionClient.reauthenticateCurrentAccount("user-1"),
    ).rejects.toThrowError(
      "Reauthenticated user does not match the requested account.",
    );

    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("削除対象のUIDが一致しない場合はAuthアカウントを残す", async () => {
    mocks.auth.currentUser = { uid: "another-user" };
    await expect(
      AccountDeletionClient.deleteCurrentAccount("user-1"),
    ).rejects.toThrowError(
      "Authenticated user changed during account deletion.",
    );

    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
