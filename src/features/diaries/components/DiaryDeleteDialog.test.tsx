import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DiaryDeleteDialog } from "./DiaryDeleteDialog";

const renderDialog = (isDeleting = false) => {
  const onOpenChange = vi.fn();
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();

  render(
    <DiaryDeleteDialog
      title="夏の思い出"
      isOpen
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onDelete={onDelete}
    />,
  );

  return { onOpenChange, onDelete, user };
};

describe("DiaryDeleteDialog", () => {
  it("削除対象と取消不能の説明を表示する", () => {
    renderDialog();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "日記を削除しますか？" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "「夏の思い出」を削除します。この操作は取り消せません。",
      ),
    ).toBeInTheDocument();
  });

  it("キャンセル操作でDialogを閉じるよう通知する", async () => {
    const { onOpenChange, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("削除操作を1回実行する", async () => {
    const { onDelete, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("削除中は操作を無効化し、close要求を無視する", async () => {
    const { onOpenChange, user } = renderDialog(true);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "削除中..." })).toBeDisabled();

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
