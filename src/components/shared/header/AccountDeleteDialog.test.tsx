import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountDeleteDialog } from "./AccountDeleteDialog";

const renderDialog = (isDeleting = false) => {
  const onOpenChange = vi.fn();
  const onDelete = vi.fn();
  const user = userEvent.setup();

  render(
    <AccountDeleteDialog
      open
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onDelete={onDelete}
    />,
  );

  return { onDelete, onOpenChange, user };
};

describe("AccountDeleteDialog", () => {
  it("削除対象、保持対象、本人確認を説明する", () => {
    renderDialog();

    expect(screen.getByText(/日記、画像、プロフィール/)).toBeInTheDocument();
    expect(screen.getByText(/契約同意記録のみ5年間保持/)).toBeInTheDocument();
    expect(screen.getByText(/Googleによる本人確認/)).toBeInTheDocument();
  });

  it("削除ボタンで削除を通知する", async () => {
    const { onDelete, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("削除中は操作を無効化する", () => {
    renderDialog(true);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "削除中…" })).toBeDisabled();
  });
});
