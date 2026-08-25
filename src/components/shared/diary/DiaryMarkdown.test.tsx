import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiaryMarkdown } from "./DiaryMarkdown";

const markdown = `# 今日の記録

一行目
二行目

**大切なこと**と~~取り消したこと~~

- [x] 完了したこと
- [ ] これからすること

> 覚えておきたい言葉

| 時間 | 出来事 |
| --- | --- |
| 朝 | 散歩 |

\`プレビュー\`で確認する。

[Markdown Guide](https://www.markdownguide.org/)

![外部画像](https://example.com/tracking.png)

<span data-danger="true">HTMLの内容</span>`;

describe("DiaryMarkdown", () => {
  it("GFMを日記本文向けの要素として描画する", () => {
    render(<DiaryMarkdown>{markdown}</DiaryMarkdown>);

    expect(
      screen.getByRole("heading", { level: 1, name: "今日の記録" }),
    ).toBeInTheDocument();
    expect(screen.getByText("大切なこと").tagName).toBe("STRONG");
    expect(screen.getByText("取り消したこと").tagName).toBe("DEL");
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
    expect(screen.getAllByRole("checkbox")[1]).not.toBeChecked();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("プレビュー").tagName).toBe("CODE");
  });

  it("通常テキストの単一改行を維持する", () => {
    render(<DiaryMarkdown>{markdown}</DiaryMarkdown>);

    const paragraph = screen.getByText((_, element) =>
      Boolean(element?.textContent === "一行目\n二行目"),
    );
    expect(paragraph).toHaveClass("whitespace-pre-wrap");
  });

  it("外部リンクを安全に開き、HTMLとMarkdown画像を描画しない", () => {
    const { container } = render(<DiaryMarkdown>{markdown}</DiaryMarkdown>);

    expect(
      screen.getByRole("link", { name: "Markdown Guide" }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: "Markdown Guide" }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("[data-danger]")).not.toBeInTheDocument();
    expect(screen.getByText("HTMLの内容")).toBeInTheDocument();
  });

  it("抜粋ではMarkdown要素とリンク先を除いて本文だけを表示する", () => {
    const { container } = render(
      <DiaryMarkdown variant="excerpt">{markdown}</DiaryMarkdown>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container).toHaveTextContent("今日の記録");
    expect(container).toHaveTextContent("Markdown Guide");
    expect(container.textContent).not.toContain("https://");
  });
});
