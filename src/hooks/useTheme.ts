import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

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

    try {
      m.addEventListener("change", onChange);
    } catch {
      // Safari fallback
      // @ts-ignore
      m.addListener(onChange);
    }

    return () => {
      try {
        m.removeEventListener("change", onChange);
      } catch {
        // @ts-ignore
        m.removeListener(onChange);
      }
    };
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return { theme, setTheme } as const;
}

export default useTheme;
