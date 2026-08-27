import { Textarea } from "@/components/ui/textarea";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DiaryMarkdownEditor } from "./DiaryMarkdownEditor";

const EditorHarness = () => {
  const [content, setContent] = useState("# 最初の見出し");

  return (
    <DiaryMarkdownEditor content={content} resetKey="diary-1">
      <Textarea
        aria-label="日記本文"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
    </DiaryMarkdownEditor>
  );
};

describe("DiaryMarkdownEditor", () => {
  it("入力値を保持したままMarkdownプレビューへ切り替える", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    const textarea = screen.getByRole("textbox", { name: "日記本文" });
    await user.clear(textarea);
    await user.type(textarea, "## 更新した見出し");
    await user.click(screen.getByRole("tab", { name: "プレビュー" }));

    expect(
      screen.getByRole("heading", { level: 2, name: "更新した見出し" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "入力" }));
    expect(screen.getByRole("textbox", { name: "日記本文" })).toHaveValue(
      "## 更新した見出し",
    );
  });

  it("空の本文ではプレビュー用の案内を表示する", async () => {
    const user = userEvent.setup();
    render(
      <DiaryMarkdownEditor content="  " resetKey="empty-diary">
        <Textarea aria-label="日記本文" value="  " readOnly />
      </DiaryMarkdownEditor>,
    );

    await user.click(screen.getByRole("tab", { name: "プレビュー" }));

    expect(
      screen.getByText("プレビューする本文がありません"),
    ).toBeInTheDocument();
  });

  it("矢印キーで入力とプレビューを切り替えられる", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    const writeTab = screen.getByRole("tab", { name: "入力" });
    writeTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "プレビュー" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "最初の見出し" }),
    ).toBeInTheDocument();
  });

  it("対象日記が変わると入力タブへ戻る", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DiaryMarkdownEditor content="# 本文" resetKey="diary-1">
        <Textarea aria-label="日記本文" value="# 本文" readOnly />
      </DiaryMarkdownEditor>,
    );
    await user.click(screen.getByRole("tab", { name: "プレビュー" }));
    expect(screen.getByRole("tab", { name: "プレビュー" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    rerender(
      <DiaryMarkdownEditor content="# 本文" resetKey="diary-2">
        <Textarea aria-label="日記本文" value="# 本文" readOnly />
      </DiaryMarkdownEditor>,
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "入力" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });
});
