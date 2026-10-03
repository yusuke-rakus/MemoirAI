import { useEffect, useState } from "react";

import { DEFAULT_PRIMARY_COLOR_KEY } from "@/constants/primaryColors";
import { DEFAULT_THEME_KEY } from "@/constants/themes";
import { UserProfileClient } from "@/lib/service/userProfileClient";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

export type UserInitializationStatus = "idle" | "loading" | "ready" | "error";

export const initializeUserSettings = async (
  uid: string,
  displayName?: string | null,
) => {
  if (!uid) {
    throw new Error("uid is required to initialize user settings.");
  }

  const currentSettings = await UserSettingsClient.getByUid<{
    primaryColor?: string;
    theme?: string;
    markdownEditorEnabled?: unknown;
    createdAt?: unknown;
  }>(uid);

  if (!(
    currentSettings?.primaryColor &&
    currentSettings.theme &&
    typeof currentSettings.markdownEditorEnabled === "boolean" &&
    currentSettings.createdAt
  )) {
    const now = new Date();
    const updateData: Record<string, unknown> = {
      primaryColor: currentSettings?.primaryColor ?? DEFAULT_PRIMARY_COLOR_KEY,
      theme: currentSettings?.theme ?? DEFAULT_THEME_KEY,
      markdownEditorEnabled: currentSettings?.markdownEditorEnabled === true,
      updatedAt: now,
    };

    if (!currentSettings?.createdAt) {
      updateData.createdAt = now;
    }

    await UserSettingsClient.update(uid, updateData);
  }

  await UserProfileClient.initialize(uid, displayName);
};

export const useUserInitialization = (
  uid?: string,
  displayName?: string | null,
  enabled = false,
) => {
  const [state, setState] = useState<{
    uid?: string;
    status: UserInitializationStatus;
  }>({ status: "idle" });
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!uid || !enabled) {
      setState({ uid, status: "idle" });
      return;
    }

    let isCurrent = true;
    setState({ uid, status: "loading" });

    void initializeUserSettings(uid, displayName)
      .then(() => {
        if (isCurrent) setState({ uid, status: "ready" });
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize user settings", error);
        if (isCurrent) setState({ uid, status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [displayName, enabled, requestId, uid]);

  return {
    status:
      uid && enabled && state.uid === uid ? state.status : ("idle" as const),
    retry: () => setRequestId((current) => current + 1),
  };
};
