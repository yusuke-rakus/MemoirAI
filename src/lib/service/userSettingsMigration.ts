import { DEFAULT_PRIMARY_COLOR_KEY } from "@/constants/primaryColors";
import { DEFAULT_THEME_KEY } from "@/constants/themes";
import { UserProfileClient } from "@/lib/service/userProfileClient";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

const initializeAppearanceSettings = async (uid: string) => {
  const currentSettings = await UserSettingsClient.getByUid<{
    primaryColor?: string;
    theme?: string;
    createdAt?: unknown;
  }>(uid);
  if (
    currentSettings?.primaryColor &&
    currentSettings.theme &&
    currentSettings.createdAt
  ) {
    return;
  }

  const now = new Date();

  const updateData: Record<string, unknown> = {
    primaryColor: currentSettings?.primaryColor ?? DEFAULT_PRIMARY_COLOR_KEY,
    theme: currentSettings?.theme ?? DEFAULT_THEME_KEY,
    updatedAt: now,
  };

  if (!currentSettings?.createdAt) {
    updateData.createdAt = now;
  }

  await UserSettingsClient.update(uid, updateData);
};

const userSettingsMigrations = [initializeAppearanceSettings] as const;

export const runUserSettingsMigrations = async (
  uid: string,
  displayName?: string | null,
) => {
  if (!uid) {
    throw new Error("uid is required to run user settings migrations.");
  }

  for (const migrate of userSettingsMigrations) {
    await migrate(uid);
  }

  await UserProfileClient.initialize(uid, displayName);
};
