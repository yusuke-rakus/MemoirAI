import {
  DEFAULT_THEME_KEY,
  normalizeThemeKey,
  type THemeKey,
} from "@/constants/themes";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserSettingsClient } from "@/lib/service/userSettingsClient";
import { useCallback, useEffect, useState } from "react";

export function useTheme() {
  const { localUser } = useLocalUser();
  const [theme, setThemeState] = useState<THemeKey>(DEFAULT_THEME_KEY);

  useEffect(() => {
    setThemeState(normalizeThemeKey(localUser.theme));
  }, [localUser.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const m = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const effective =
        theme === "system" ? (m.matches ? "dark" : "light") : theme;
      if (effective === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    };

    apply();

    const onChange = () => {
      if (theme === "system") apply();
    };

    m.addEventListener("change", onChange);

    return () => {
      m.removeEventListener("change", onChange);
    };
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme: THemeKey) => {
      setThemeState(nextTheme);
      if (!localUser.uid) {
        return;
      }

      void UserSettingsClient.update(localUser.uid, {
        theme: nextTheme,
        updatedAt: new Date(),
      });
    },
    [localUser.uid],
  );

  return { theme, setTheme } as const;
}

export default useTheme;
