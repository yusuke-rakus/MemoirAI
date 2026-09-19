import { describe, expect, it } from "vitest";

import { matchesShortcut, shortcutSurfaceAvailable } from "../shortcuts";

describe("shortcut matching", () => {
  it("OSごとの修飾キーとShiftを厳密に判定する", () => {
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", {
          key: "O",
          metaKey: true,
          shiftKey: true,
        }),
        "newDiary",
        true,
      ),
    ).toBe(true);
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", {
          key: "O",
          ctrlKey: true,
          shiftKey: true,
        }),
        "newDiary",
        false,
      ),
    ).toBe(true);
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", { key: "o", ctrlKey: true }),
        "newDiary",
        false,
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
        "search",
        true,
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          ctrlKey: true,
        }),
        "search",
        true,
      ),
    ).toBe(false);
  });
  it.each([
    { isComposing: true },
    { repeat: true },
    { altKey: true },
    { shiftKey: true },
    { keyCode: 229 },
  ])("変換中・長押し・余分な修飾キーを無視する %j", (extra) => {
    expect(
      matchesShortcut(
        new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, ...extra }),
        "save",
        false,
      ),
    ).toBe(false);
  });
  it("入力中はサイドバーを開閉せず検索と保存を許可する", () => {
    const input = document.createElement("textarea");
    const event = new KeyboardEvent("keydown", { key: "b", ctrlKey: true });
    input.dispatchEvent(event);
    expect(matchesShortcut(event, "sidebar", false)).toBe(false);
    const save = new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true });
    input.dispatchEvent(save);
    expect(matchesShortcut(save, "save", false)).toBe(true);
  });
  it("処理済みイベントを再実行しない", () => {
    const event = new KeyboardEvent("keydown", { key: "?", cancelable: true });
    event.preventDefault();
    expect(matchesShortcut(event, "help")).toBe(false);
  });
  it("最前面ダイアログのみ操作でき、閉じたsurfaceは妨げない", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    expect(shortcutSurfaceAvailable()).toBe(false);
    expect(shortcutSurfaceAvailable(dialog)).toBe(true);
    const menu = document.createElement("div");
    menu.setAttribute("role", "menu");
    document.body.append(menu);
    expect(shortcutSurfaceAvailable(dialog)).toBe(false);
    menu.dataset.state = "closed";
    expect(shortcutSurfaceAvailable(dialog)).toBe(true);
    dialog.remove();
    menu.remove();
  });
});
