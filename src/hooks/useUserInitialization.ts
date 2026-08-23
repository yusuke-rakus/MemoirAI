import { runUserSettingsMigrations } from "@/lib/service/userSettingsMigration";
import { useEffect, useState } from "react";

export type UserInitializationStatus = "idle" | "loading" | "ready" | "error";

export const useUserInitialization = (
  uid?: string,
  displayName?: string | null,
  enabled = false,
) => {
  const [status, setStatus] = useState<UserInitializationStatus>("idle");
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!uid || !enabled) {
      setStatus("idle");
      return;
    }

    let isCurrent = true;
    setStatus("loading");

    void runUserSettingsMigrations(uid, displayName)
      .then(() => {
        if (isCurrent) setStatus("ready");
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize user settings", error);
        if (isCurrent) setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [displayName, enabled, requestId, uid]);

  return {
    status,
    retry: () => setRequestId((current) => current + 1),
  };
};
