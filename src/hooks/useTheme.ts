import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { normalizeThemeKey, type THemeKey } from "@/constants/themes";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";

export const useApplyTheme = () => {
  const { localUser } = useLocalUser();
  const theme = normalizeThemeKey(localUser.theme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && media.matches),
      );
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
};

export function useTheme() {
  const { localUser, setLocalUser } = useLocalUser();
  const theme = normalizeThemeKey(localUser.theme);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const setTheme = useCallback(
    async (nextTheme: THemeKey) => {
      if (!localUser.uid || isSavingTheme || nextTheme === theme) return false;
      const uid = localUser.uid;
      setLocalUser((current) => ({ ...current, theme: nextTheme }));
      setIsSavingTheme(true);
      try {
        await UserSettingsClient.update(uid, {
          theme: nextTheme,
          updatedAt: new Date(),
        });
        return true;
      } catch (error) {
        console.error("Failed to save theme settings", error);
        setLocalUser((current) =>
          current.uid === uid && current.theme === nextTheme
            ? { ...current, theme }
            : current,
        );
        toast.error("テーマ設定の保存に失敗しました");
        return false;
      } finally {
        setIsSavingTheme(false);
      }
    },
    [isSavingTheme, localUser.uid, setLocalUser, theme],
  );

  return { theme, setTheme, isSavingTheme } as const;
}

export default useTheme;
