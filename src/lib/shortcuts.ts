export const shortcuts = {
  newDiary: {
    key: "o",
    mod: true,
    shift: true,
    label: "新しい日記",
    group: "共通操作",
    input: true,
  },
  search: {
    key: "k",
    mod: true,
    label: "日記を検索",
    group: "共通操作",
    input: true,
  },
  sidebar: {
    key: "b",
    mod: true,
    label: "サイドバーを開閉",
    group: "共通操作",
    input: false,
  },
  help: {
    key: "?",
    label: "ショートカットの解説",
    group: "共通操作",
    input: false,
  },
  save: {
    key: "Enter",
    mod: true,
    label: "保存（作成時は選択中の保存方法）",
    group: "日記の作成・編集",
    input: true,
  },
  resultPrevious: {
    key: "ArrowUp",
    label: "前の検索結果を選択",
    group: "日記検索",
    input: true,
  },
  resultNext: {
    key: "ArrowDown",
    label: "次の検索結果を選択",
    group: "日記検索",
    input: true,
  },
  resultOpen: {
    key: "Enter",
    label: "選択中の検索結果を開く",
    group: "日記検索",
    input: true,
  },
  dayPrevious: {
    key: "ArrowLeft",
    label: "前日へ移動",
    group: "カレンダー",
    input: false,
  },
  dayNext: {
    key: "ArrowRight",
    label: "翌日へ移動",
    group: "カレンダー",
    input: false,
  },
  weekPrevious: {
    key: "ArrowUp",
    label: "7日前へ移動",
    group: "カレンダー",
    input: false,
  },
  weekNext: {
    key: "ArrowDown",
    label: "7日後へ移動",
    group: "カレンダー",
    input: false,
  },
  daySelect: {
    key: "Enter",
    label: "日付を選択",
    group: "カレンダー",
    input: false,
  },
  daySelectSpace: {
    key: " ",
    label: "日付を選択",
    group: "カレンダー",
    input: false,
  },
  today: { key: "t", label: "今日へ移動", group: "カレンダー", input: false },
} satisfies Record<string, Shortcut>;

type Shortcut = {
  key: string;
  mod?: boolean;
  shift?: boolean;
  label: string;
  group: string;
  input: boolean;
};
export type ShortcutId = keyof typeof shortcuts;
export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
export const isEditing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  Boolean(
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
    ),
  );

export function matchesShortcut(
  event: KeyboardEvent,
  id: ShortcutId,
  mac = isMac(),
) {
  const shortcut: Shortcut = shortcuts[id];
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.repeat ||
    event.altKey
  )
    return false;
  if (!shortcut.input && isEditing(event.target)) return false;
  const mod = mac ? event.metaKey : event.ctrlKey;
  const otherMod = mac ? event.ctrlKey : event.metaKey;
  return (
    !otherMod &&
    mod === Boolean(shortcut.mod) &&
    (shortcut.key === "?" || event.shiftKey === Boolean(shortcut.shift)) &&
    event.key.toLowerCase() === shortcut.key.toLowerCase()
  );
}

export function shortcutLabel(id: ShortcutId) {
  const shortcut: Shortcut = shortcuts[id];
  const keys: Record<string, string> = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    " ": "Space",
  };
  return [
    shortcut.mod && (isMac() ? "⌘" : "Ctrl"),
    shortcut.shift && "Shift",
    keys[shortcut.key] ??
      (shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key),
  ]
    .filter(Boolean)
    .join(" + ");
}

// Only the foremost surface may receive an application shortcut.
export function shortcutSurfaceAvailable(scope?: HTMLElement | null) {
  const surfaces = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[role="dialog"], [role="alertdialog"], [role="menu"], [data-slot="popover-content"], .fc-popover',
    ),
  ).filter(
    (element) =>
      !element.closest('[aria-hidden="true"], [data-state="closed"], [hidden]'),
  );
  const top = surfaces[surfaces.length - 1];
  return scope ? top === scope : !top;
}
