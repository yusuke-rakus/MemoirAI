import { describe, expect, it } from "vitest";

import { parseMonthRoute } from "../monthRoute";

describe("parseMonthRoute", () => {
  it("現在から離れた有効な年月もそのまま解決する", () => {
    const date = parseMonthRoute("2030", "1");
    expect(date?.getFullYear()).toBe(2030);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(1);
  });
  it.each([
    ["2026", "13"],
    ["2026", "0"],
    ["2026", "1.5"],
    ["2026", "abc"],
    ["NaN", "9"],
    ["99", "1"],
    ["10000", "1"],
    [undefined, undefined],
  ])("不正な年月 %s/%s を拒否する", (year, month) => {
    expect(parseMonthRoute(year, month)).toBeNull();
  });
});
