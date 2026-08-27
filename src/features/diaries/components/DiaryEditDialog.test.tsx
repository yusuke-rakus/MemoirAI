import type { Diary } from "@/types/diary/diary";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";
import { DiaryEditDialog } from "./DiaryEditDialog";

const diary: Diary = {
  id: "diary-1",
  uid: "user-1",
  date: Timestamp.fromDate(new Date(2026, 7, 20)),
  title: "夏の記録",
  content: "もとの本文",
  tags: [],
  createdAt: Timestamp.fromDate(new Date(2026, 7, 20)),
};

describe("DiaryEditDialog Markdown", () => {
  it("プレビューしたMarkdown本文を変更せずに送信する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <DiaryEditDialog
        diary={diary}
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "本文" });
    const markdown = "## 更新した記録\n\n**大切な出来事**を書いた。";
    await user.clear(textarea);
    await user.type(textarea, markdown);
    await user.click(screen.getByRole("tab", { name: "プレビュー" }));

    expect(
      screen.getByRole("heading", { level: 2, name: "更新した記録" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "入力" }));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ content: markdown }),
      );
    });
  });
});
