import { describe, expect, it } from "vitest";

import { tagBgMap } from "./tagColors";

describe("tagBgMap", () => {
  it("defaultタグには固定の無彩色背景を使う", () => {
    expect(tagBgMap.default).toBe("bg-tag-default");
  });
});
