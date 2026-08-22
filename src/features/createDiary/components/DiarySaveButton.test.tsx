import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { DiarySaveMode } from "../types";
import { DiarySaveButton } from "./DiarySaveButton";

const SaveButtonHarness = ({ onSave = vi.fn() }: { onSave?: () => void }) => {
  const [saveMode, setSaveMode] = useState<DiarySaveMode>("standard");

  return (
    <DiarySaveButton
      saveMode={saveMode}
      createPhase="idle"
      onSaveModeChange={setSaveMode}
      onSave={onSave}
    />
  );
};

describe("DiarySaveButton", () => {
  it("初期値は通常保存で、メインボタンから保存する", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SaveButtonHarness onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledOnce();
  });

  it("キーボードで絵日記保存を選択し、ラベルと選択状態を更新する", async () => {
    const user = userEvent.setup();
    render(<SaveButtonHarness />);

    const trigger = screen.getByRole("button", { name: "保存方法を選択" });
    trigger.focus();
    await user.keyboard("{Enter}");

    const illustratedItem = await screen.findByRole("menuitemradio", {
      name: /絵日記で保存/,
    });
    illustratedItem.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "絵日記で保存" })).toBeVisible();

    await user.click(trigger);
    expect(
      await screen.findByRole("menuitemradio", { name: /絵日記で保存/ }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it.each([
    ["generating", "画像を生成中..."],
    ["saving", "保存中..."],
  ] as const)("%s中は両方のボタンを無効化する", (createPhase, label) => {
    render(
      <DiarySaveButton
        saveMode="illustrated"
        createPhase={createPhase}
        onSaveModeChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: label })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "保存方法を選択" }),
    ).toBeDisabled();
  });

  it("再マウント時は通常保存へ戻る", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SaveButtonHarness />);

    await user.click(screen.getByRole("button", { name: "保存方法を選択" }));
    await user.click(
      await screen.findByRole("menuitemradio", { name: /絵日記で保存/ }),
    );
    expect(screen.getByRole("button", { name: "絵日記で保存" })).toBeVisible();

    unmount();
    render(<SaveButtonHarness />);

    expect(screen.getByRole("button", { name: "保存" })).toBeVisible();
  });
});
