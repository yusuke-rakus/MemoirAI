import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("既定variantはプライマリ設定から独立した文字色を使う", () => {
    render(<Badge>散歩</Badge>);

    const badge = screen.getByText("散歩");

    expect(badge).toHaveClass("text-badge-foreground");
    expect(badge).not.toHaveClass("text-primary-foreground");
  });
});
