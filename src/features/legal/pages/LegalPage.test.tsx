import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLegalReturnDestination } from "../hooks/useLegalReturnDestination";
import { LegalPage } from "./LegalPage";

vi.mock("../hooks/useLegalReturnDestination", () => ({
  useLegalReturnDestination: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useLegalReturnDestination).mockReturnValue({
    label: "ログインへ戻る",
    to: "/login",
  });
  Element.prototype.scrollIntoView = vi.fn();
});

describe("LegalPage", () => {
  it("3文書を目次とともに表示する", () => {
    render(
      <MemoryRouter initialEntries={["/legal"]}>
        <LegalPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "利用規約", level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "利用規約", level: 2 }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "プライバシーポリシー" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "AIデータ利用方針" }),
    ).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "リーガル文書の目次" }),
    ).toBeVisible();
  });

  it("hash付きURLでは対象文書まで移動する", async () => {
    render(
      <MemoryRouter initialEntries={["/legal#privacy"]}>
        <LegalPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        block: "start",
      }),
    );
  });
});
