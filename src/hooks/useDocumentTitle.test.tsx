import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

const TitleView = ({ title }: { title: string }) => {
  useDocumentTitle(title, " | MemoirAI");
  return null;
};

describe("useDocumentTitle", () => {
  it("unmount時にsuffixを重複させず元のtitleへ戻す", () => {
    document.title = "Initial";
    const view = render(<TitleView title="利用規約" />);

    expect(document.title).toBe("利用規約 | MemoirAI");

    view.unmount();

    expect(document.title).toBe("Initial");
  });
});
