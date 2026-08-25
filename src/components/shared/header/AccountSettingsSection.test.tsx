import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountSettingsSection } from "./AccountSettingsSection";

describe("AccountSettingsSection", () => {
  it("簡潔な説明だけを表示し、削除の詳細は表示しない", () => {
    render(<AccountSettingsSection disabled={false} onDelete={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "アカウントの削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("アカウントと保存データを削除します。"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/日記、画像、プロフィール/)).toBeNull();
    expect(screen.queryByText(/5年間保持/)).toBeNull();
  });

  it("削除操作を通知する", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<AccountSettingsSection disabled={false} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "アカウントを削除" }));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
