import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  initializeUserSettings,
  useUserInitialization,
} from "../useUserInitialization";

const mocks = vi.hoisted(() => ({
  getByUid: vi.fn(),
  update: vi.fn(),
  initializeProfile: vi.fn(),
}));

vi.mock("@/lib/service/userSettingsClient", () => ({
  UserSettingsClient: {
    getByUid: mocks.getByUid,
    update: mocks.update,
  },
}));

vi.mock("@/lib/service/userProfileClient", () => ({
  UserProfileClient: {
    initialize: mocks.initializeProfile,
  },
}));

describe("initializeUserSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue(undefined);
    mocks.initializeProfile.mockResolvedValue(undefined);
  });

  it("既存設定にMarkdownエディタ表示設定がなければオフで追加する", async () => {
    mocks.getByUid.mockResolvedValue({
      primaryColor: "default",
      theme: "system",
      createdAt: new Date(),
    });

    await initializeUserSettings("user-1");

    expect(mocks.update).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        markdownEditorEnabled: false,
        updatedAt: expect.any(Date),
      }),
    );
  });

  it("有効済みの設定を変更しない", async () => {
    mocks.getByUid.mockResolvedValue({
      primaryColor: "default",
      theme: "system",
      markdownEditorEnabled: true,
      createdAt: new Date(),
    });

    await initializeUserSettings("user-1");

    expect(mocks.update).not.toHaveBeenCalled();
  });
});

describe("useUserInitialization ownership", () => {
  it("UID変更直後は新UIDの初期化前に前ユーザーのreadyを返さない", async () => {
    let finish!: (value: null) => void;
    mocks.getByUid.mockImplementation((uid: string) =>
      uid === "user-1"
        ? Promise.resolve(null)
        : new Promise<null>((resolve) => {
            finish = resolve;
          }),
    );
    mocks.update.mockResolvedValue(undefined);
    mocks.initializeProfile.mockResolvedValue(undefined);
    const seen: string[] = [];
    const { result, rerender } = renderHook(
      ({ uid }) => {
        const initialization = useUserInitialization(uid, null, true);
        if (uid === "user-2") seen.push(initialization.status);
        return initialization;
      },
      { initialProps: { uid: "user-1" } },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    rerender({ uid: "user-2" });
    expect(seen).not.toContain("ready");
    await act(async () => finish(null));
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });
});
