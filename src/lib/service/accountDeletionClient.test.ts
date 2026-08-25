import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountDeletionClient } from "./accountDeletionClient";

const mocks = vi.hoisted(() => ({
  auth: {
    currentUser: { uid: "user-1" } as { uid: string } | null,
  },
  deleteUser: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
  clearAllByUid: vi.fn(),
  deleteAllByUid: vi.fn(),
  deleteSharedDiaries: vi.fn(),
  deletePrivateData: vi.fn(),
  retainLegalAcceptances: vi.fn(),
}));

vi.mock("@/firebase/firebase", () => ({
  auth: mocks.auth,
  provider: { providerId: "google.com" },
}));

vi.mock("firebase/auth", () => ({
  deleteUser: mocks.deleteUser,
  reauthenticateWithPopup: mocks.reauthenticateWithPopup,
}));

vi.mock("./diaryDraftClient", () => ({
  DiaryDraftClient: { clearAllByUid: mocks.clearAllByUid },
}));

vi.mock("./userStorageClient", () => ({
  UserStorageClient: { deleteAllByUid: mocks.deleteAllByUid },
}));

vi.mock("./userAccountDataClient", () => ({
  UserAccountDataClient: {
    deleteSharedDiaries: mocks.deleteSharedDiaries,
    deletePrivateData: mocks.deletePrivateData,
    retainLegalAcceptances: mocks.retainLegalAcceptances,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.currentUser = { uid: "user-1" };
  mocks.reauthenticateWithPopup.mockResolvedValue({
    user: mocks.auth.currentUser,
  });
});

describe("AccountDeletionClient", () => {
  it("本人確認後に全データを順番に削除し、最後にAuthを削除する", async () => {
    await AccountDeletionClient.deleteCurrentAccount("user-1");

    expect(mocks.reauthenticateWithPopup).toHaveBeenCalledWith(
      mocks.auth.currentUser,
      { providerId: "google.com" },
    );
    expect(mocks.clearAllByUid).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteAllByUid).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteSharedDiaries).toHaveBeenCalledWith("user-1");
    expect(mocks.deletePrivateData).toHaveBeenCalledWith("user-1");
    expect(mocks.retainLegalAcceptances).toHaveBeenCalledWith("user-1");
    expect(mocks.deleteUser).toHaveBeenCalledWith(mocks.auth.currentUser);

    expect(mocks.clearAllByUid.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteAllByUid.mock.invocationCallOrder[0],
    );
    expect(mocks.deleteAllByUid.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteSharedDiaries.mock.invocationCallOrder[0],
    );
    expect(
      mocks.retainLegalAcceptances.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.deleteUser.mock.invocationCallOrder[0]);
  });

  it("ログイン中のUIDが一致しない場合は何も削除しない", async () => {
    mocks.auth.currentUser = { uid: "another-user" };

    await expect(
      AccountDeletionClient.deleteCurrentAccount("user-1"),
    ).rejects.toThrowError(
      "Authenticated user does not match the requested account.",
    );

    expect(mocks.reauthenticateWithPopup).not.toHaveBeenCalled();
    expect(mocks.clearAllByUid).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("再認証したUIDが一致しない場合はデータを削除しない", async () => {
    mocks.reauthenticateWithPopup.mockResolvedValueOnce({
      user: { uid: "another-user" },
    });

    await expect(
      AccountDeletionClient.deleteCurrentAccount("user-1"),
    ).rejects.toThrowError(
      "Reauthenticated user does not match the requested account.",
    );

    expect(mocks.clearAllByUid).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it.each([
    ["local draft", mocks.clearAllByUid],
    ["Storage", mocks.deleteAllByUid],
    ["shared diaries", mocks.deleteSharedDiaries],
    ["private data", mocks.deletePrivateData],
    ["legal acceptance", mocks.retainLegalAcceptances],
  ])("%sの削除に失敗した場合はAuthアカウントを残す", async (_, stage) => {
    stage.mockRejectedValueOnce(new Error("delete failed"));

    await expect(
      AccountDeletionClient.deleteCurrentAccount("user-1"),
    ).rejects.toThrowError("delete failed");

    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
