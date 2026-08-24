import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { DiaryCreationProgress } from "../types";
import { DiaryCreationProgressDialog } from "./DiaryCreationProgressDialog";

const standardProgress: DiaryCreationProgress = {
  saveMode: "standard",
  metadata: "active",
  illustration: null,
  persistence: "pending",
};

describe("DiaryCreationProgressDialog", () => {
  it("通常保存ではタイトル・タグと保存の工程だけを表示する", () => {
    render(<DiaryCreationProgressDialog progress={standardProgress} />);

    expect(screen.getByRole("dialog", { name: "日記を作成中" })).toBeVisible();
    expect(screen.getByText("タイトルとタグを生成中")).toBeVisible();
    expect(screen.getByText("日記を保存予定")).toBeVisible();
    expect(screen.queryByText(/水彩イラストを生成/)).not.toBeInTheDocument();
  });

  it("処理中だけprimary、完了・待機中はsecondary textで表示する", () => {
    render(
      <DiaryCreationProgressDialog
        progress={{
          saveMode: "illustrated",
          metadata: "complete",
          illustration: "active",
          persistence: "pending",
        }}
      />,
    );

    expect(
      screen.getByText("タイトルとタグを生成しました").closest("li"),
    ).toHaveClass("text-muted-foreground");
    expect(screen.getByText("水彩イラストを生成中").closest("li")).toHaveClass(
      "text-primary",
    );
    expect(screen.getByText("水彩イラストを生成中")).toHaveClass(
      "animate-loader-shimmer",
      "font-normal",
    );
    expect(screen.getByText("日記を保存予定").closest("li")).toHaveClass(
      "text-muted-foreground",
    );
    expect(document.querySelector(".lucide-tags")).toBeInTheDocument();
    expect(document.querySelector(".lucide-image")).toBeInTheDocument();
    expect(document.querySelector(".lucide-cloud-upload")).toBeInTheDocument();
  });

  it("表示用タイトル、説明、装飾アイコンを表示しない", () => {
    render(<DiaryCreationProgressDialog progress={standardProgress} />);

    expect(screen.getByText("日記を作成中")).toHaveClass("sr-only");
    expect(
      screen.queryByText("MemoirAIが日記を仕上げています"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/内容を読み取り、振り返りやすい日記/),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".lucide-sparkles")).not.toBeInTheDocument();
  });

  it("Escapeや外側操作では閉じない", async () => {
    const user = userEvent.setup();
    render(<DiaryCreationProgressDialog progress={standardProgress} />);

    await user.keyboard("{Escape}");
    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("dialog", { name: "日記を作成中" })).toBeVisible();
  });

  it("進行状態がなければ表示しない", () => {
    render(<DiaryCreationProgressDialog progress={null} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
