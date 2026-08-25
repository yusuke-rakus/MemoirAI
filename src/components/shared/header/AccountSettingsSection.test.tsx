import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountSettingsSection } from "./AccountSettingsSection";

describe("AccountSettingsSection", () => {
  it("不可逆な削除と契約同意記録の保持を説明する", () => {
    render(<AccountSettingsSection disabled={false} onDelete={vi.fn()} />);

    expect(screen.getByText(/この操作は取り消せません/)).toBeInTheDocument();
    expect(screen.getByText(/アカウント削除後5年間保持/)).toBeInTheDocument();
  });

  it("削除操作を通知する", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<AccountSettingsSection disabled={false} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "アカウントを削除" }));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
