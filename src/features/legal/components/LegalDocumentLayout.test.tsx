import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLegalReturnDestination } from "../hooks/useLegalReturnDestination";
import type { LegalDocument } from "../types/legalDocument";
import { LegalDocumentLayout } from "./LegalDocumentLayout";

vi.mock("../hooks/useLegalReturnDestination", () => ({
  useLegalReturnDestination: vi.fn(),
}));

const useLegalReturnDestinationMock = vi.mocked(useLegalReturnDestination);

const document: LegalDocument = {
  id: "terms",
  title: "利用規約",
  version: "2026-08-22.12345678",
  effectiveDate: "2026-08-22",
  introduction: "利用条件を説明します。",
  body: `### 1. 適用

本文です。

<script>alert("unsafe")</script>

[外部リンク](https://example.com)`,
};

beforeEach(() => {
  useLegalReturnDestinationMock.mockReturnValue({
    label: "ログインへ戻る",
    to: "/login",
  });
});

describe("LegalDocumentLayout", () => {
  it("Markdownを安全に描画し、規約の日付を簡潔に表示する", () => {
    const { container } = render(
      <MemoryRouter>
        <LegalDocumentLayout documents={[document]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "利用規約", level: 2 }),
    ).toBeVisible();
    expect(screen.getByText("2026年8月22日版")).toBeVisible();
    expect(screen.queryByText("2026-08-22.12345678")).not.toBeInTheDocument();
    expect(screen.queryByText("制定・施行日")).not.toBeInTheDocument();
    expect(screen.queryByText("文書バージョン")).not.toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "外部リンク" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("未ログインではログイン画面へ戻る", () => {
    render(
      <MemoryRouter>
        <LegalDocumentLayout documents={[document]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "ログインへ戻る" }),
    ).toHaveAttribute("href", "/login");
  });

  it("ログイン済みではアプリへ戻る", () => {
    useLegalReturnDestinationMock.mockReturnValue({
      label: "アプリへ戻る",
      to: "/",
    });

    render(
      <MemoryRouter>
        <LegalDocumentLayout documents={[document]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "アプリへ戻る" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
