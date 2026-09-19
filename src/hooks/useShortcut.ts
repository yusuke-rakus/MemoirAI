import { useEffect } from "react";

import {
  matchesShortcut,
  type ShortcutId,
  shortcutSurfaceAvailable,
} from "@/lib/shortcuts";

export function useShortcut(
  id: ShortcutId,
  action: () => void,
  options: { enabled?: boolean; scope?: () => HTMLElement | null } = {},
) {
  const { enabled = true, scope } = options;
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      const surface = scope?.();
      if (
        (scope && !surface) ||
        !matchesShortcut(event, id) ||
        !shortcutSurfaceAvailable(surface)
      )
        return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [id, action, enabled, scope]);
}
