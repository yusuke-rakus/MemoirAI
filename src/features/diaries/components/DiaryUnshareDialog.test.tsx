import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DiaryUnshareDialog } from "./DiaryUnshareDialog";

const renderDialog = (isUnsharing = false) => {
  const onOpenChange = vi.fn();
  const onUnshare = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();

  render(
    <DiaryUnshareDialog
      title="夏の思い出"
      isOpen
      isUnsharing={isUnsharing}
      onOpenChange={onOpenChange}
      onUnshare={onUnshare}
    />,
  );

  return { onOpenChange, onUnshare, user };
};

describe("DiaryUnshareDialog", () => {
  it("現在のリンクが無効になり、再共有で新しいリンクになると説明する", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: "共有を停止しますか？" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "「夏の思い出」の現在の共有リンクを無効にします。再共有すると新しいリンクが発行されます。",
      ),
    ).toBeInTheDocument();
  });

  it("共有停止を1回実行する", async () => {
    const { onUnshare, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "共有を停止する" }));

    expect(onUnshare).toHaveBeenCalledOnce();
  });

  it("停止中は操作を無効化し、close要求を無視する", async () => {
    const { onOpenChange, user } = renderDialog(true);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "停止中..." })).toBeDisabled();

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
