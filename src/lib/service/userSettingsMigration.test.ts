import { beforeEach, describe, expect, it, vi } from "vitest";

import { runUserSettingsMigrations } from "./userSettingsMigration";

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

describe("runUserSettingsMigrations", () => {
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

    await runUserSettingsMigrations("user-1");

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

    await runUserSettingsMigrations("user-1");

    expect(mocks.update).not.toHaveBeenCalled();
  });
});
