import { addDays, format, isSameMonth, parseISO, startOfMonth } from "date-fns";
import {
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";

import { useShortcut } from "@/hooks/useShortcut";
import {
  matchesShortcut,
  type ShortcutId,
  shortcutSurfaceAvailable,
} from "@/lib/shortcuts";

export function useCalendarKeyboard(
  date: Date,
  setDate: (date: Date) => void,
  container: RefObject<HTMLDivElement | null>,
  onSelect?: (date: Date) => void,
) {
  const navigate = useNavigate();
  const focusedDate = useRef(
    isSameMonth(date, new Date()) ? new Date() : startOfMonth(date),
  );
  const pendingFocus = useRef(false);
  const frame = useRef<number | null>(null);

  const syncCells = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const key = format(focusedDate.current, "yyyy-MM-dd");
      container.current
        ?.querySelectorAll<HTMLElement>("[data-shortcut-date]")
        .forEach((cell) => {
          cell.tabIndex = cell.dataset.shortcutDate === key ? 0 : -1;
          if (cell.tabIndex === 0 && pendingFocus.current) {
            cell.focus({ preventScroll: true });
            pendingFocus.current = false;
          }
        });
    });
  }, [container]);

  useEffect(() => {
    if (!isSameMonth(focusedDate.current, date)) {
      focusedDate.current = isSameMonth(date, new Date())
        ? new Date()
        : startOfMonth(date);
    }
    syncCells();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [date, syncCells]);

  const focusDate = (next: Date) => {
    focusedDate.current = next;
    pendingFocus.current = true;
    if (!isSameMonth(next, date)) {
      setDate(startOfMonth(next));
      navigate(`/calendar/${next.getFullYear()}/${next.getMonth() + 1}`);
    } else syncCells();
  };
  useShortcut("today", () => focusDate(new Date()));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      !target.dataset.shortcutDate ||
      !shortcutSurfaceAvailable()
    )
      return;
    const current = parseISO(target.dataset.shortcutDate);
    const moves: [ShortcutId, number][] = [
      ["dayPrevious", -1],
      ["dayNext", 1],
      ["weekPrevious", -7],
      ["weekNext", 7],
    ];
    const move = moves.find(([id]) => matchesShortcut(event.nativeEvent, id));
    if (move) {
      event.preventDefault();
      focusDate(addDays(current, move[1]));
    } else if (
      matchesShortcut(event.nativeEvent, "daySelect") ||
      matchesShortcut(event.nativeEvent, "daySelectSpace")
    ) {
      event.preventDefault();
      onSelect?.(current);
    }
  };

  return {
    onKeyDown,
    syncCells,
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      if (event.target.dataset.shortcutDate) {
        focusedDate.current = parseISO(event.target.dataset.shortcutDate);
        syncCells();
      }
    },
  };
}
