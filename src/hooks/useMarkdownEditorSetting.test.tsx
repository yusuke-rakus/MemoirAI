import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMarkdownEditorSetting } from "./useMarkdownEditorSetting";

const mocks = vi.hoisted(() => ({
  localUser: {
    uid: "user-1",
    displayName: null,
    photoURL: null,
    markdownEditorEnabled: false,
  },
  setLocalUser: vi.fn(),
  update: vi.fn(),
  toast: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/contexts/LocalUserContext", () => ({
  useLocalUser: () => ({
    localUser: mocks.localUser,
    setLocalUser: mocks.setLocalUser,
  }),
}));

vi.mock("@/lib/service/userSettingsClient", () => ({
  UserSettingsClient: {
    update: mocks.update,
  },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(mocks.toast, { error: mocks.toastError }),
}));

describe("useMarkdownEditorSetting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.localUser.markdownEditorEnabled = false;
    mocks.update.mockResolvedValue(undefined);
  });

  it("設定を即時反映してFirestoreへ保存する", async () => {
    const { result } = renderHook(() => useMarkdownEditorSetting());

    await act(async () => {
      await result.current.setMarkdownEditorEnabled(true);
    });

    expect(mocks.setLocalUser).toHaveBeenCalledWith(
      expect.objectContaining({ markdownEditorEnabled: true }),
    );
    expect(mocks.update).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        markdownEditorEnabled: true,
        updatedAt: expect.any(Date),
      }),
    );
    expect(mocks.toast).not.toHaveBeenCalled();
  });

  it("保存に失敗したら設定を元に戻してエラーを通知する", async () => {
    mocks.update.mockRejectedValueOnce(new Error("failed"));
    const { result } = renderHook(() => useMarkdownEditorSetting());

    await act(async () => {
      await result.current.setMarkdownEditorEnabled(true);
    });

    expect(mocks.setLocalUser).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ markdownEditorEnabled: true }),
    );
    expect(mocks.setLocalUser).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ markdownEditorEnabled: false }),
    );
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Markdownエディタ設定の保存に失敗しました",
    );
  });
});
