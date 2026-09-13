import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { DiaryCreationProgress } from "../../types";
import { DiaryCreationProgressDialog } from "../DiaryCreationProgressDialog";

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
    expect(screen.queryByText(/イラストを生成/)).not.toBeInTheDocument();
  });

  it("絵日記保存では完了・処理中・待機中の工程を案内する", () => {
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

    expect(screen.getByText("タイトルとタグを生成しました")).toBeVisible();
    expect(screen.getByText("イラストを生成中")).toBeVisible();
    expect(screen.getByText("日記を保存予定")).toBeVisible();
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
