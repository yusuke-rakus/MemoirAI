import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { diaryQueryKeys } from "../queryKeys";

describe("TanStack Query cache keys", () => {
  it("同一の日記keyの並行取得を1回にまとめる", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const queryFn = vi.fn().mockResolvedValue(["diary-1"]);
    const queryKey = diaryQueryKeys.byDate(
      "user-1",
      new Date("2026-09-13T00:00:00+09:00"),
    );

    await Promise.all([
      client.fetchQuery({ queryKey, queryFn }),
      client.fetchQuery({ queryKey, queryFn }),
    ]);

    expect(queryFn).toHaveBeenCalledOnce();
  });

  it("UIDと日付が異なる日別日記を別cache entryにする", () => {
    const date = new Date("2026-09-13T00:00:00+09:00");

    expect(diaryQueryKeys.byDate("user-1", date)).not.toEqual(
      diaryQueryKeys.byDate("user-2", date),
    );
    expect(diaryQueryKeys.byDate("user-1", date)).not.toEqual(
      diaryQueryKeys.byDate("user-1", new Date("2026-09-14T00:00:00+09:00")),
    );
  });
});
