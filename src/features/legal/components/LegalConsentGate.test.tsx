import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LegalConsentGate } from "./LegalConsentGate";

const renderGate = (submitError = false) => {
  const onAccept = vi.fn().mockResolvedValue(undefined);
  const onLogout = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <LegalConsentGate
        isSubmitting={false}
        submitError={submitError}
        onAccept={onAccept}
        onLogout={onLogout}
      />
    </MemoryRouter>,
  );

  return { onAccept, onLogout, user };
};

describe("LegalConsentGate", () => {
  it("統合された利用規約を別タブで開く", () => {
    renderGate();

    const link = screen.getByRole("link", { name: "利用規約" });
    expect(link).toHaveAttribute("href", "/legal");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("確認前は同意できず、check後に1回だけ保存する", async () => {
    const { onAccept, user } = renderGate();
    const submitButton = screen.getByRole("button", {
      name: "同意して利用を開始",
    });

    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("保存失敗をinlineで伝える", () => {
    renderGate(true);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "同意内容を保存できませんでした",
    );
  });
});
