import { DEFAULT_PRIMARY_COLOR_KEY } from "@/constants/primaryColors";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

const initializeAppearanceSettings = async (uid: string) => {
  const currentSettings = await UserSettingsClient.getByUid<{
    primaryColor?: string;
    createdAt?: unknown;
  }>(uid);
  const now = new Date();

  const updateData: Record<string, unknown> = {
    primaryColor: currentSettings?.primaryColor ?? DEFAULT_PRIMARY_COLOR_KEY,
    updatedAt: now,
  };

  if (!currentSettings?.createdAt) {
    updateData.createdAt = now;
  }

  await UserSettingsClient.update(uid, updateData);
};

const newUserSettingsMigrations = [initializeAppearanceSettings] as const;

export const runNewUserSettingsMigrations = async (uid: string) => {
  if (!uid) {
    throw new Error("uid is required to run user settings migrations.");
  }

  for (const migrate of newUserSettingsMigrations) {
    await migrate(uid);
  }
};
