import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sharedDiaryQueryKeys } from "@/lib/query/queryKeys";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";

import { useSharedDiarySearch } from "../useSharedDiarySearch";

vi.mock("@/lib/service/sharedDiaryClient", () => ({
  SharedDiaryClient: { getByShareId: vi.fn() },
}));
const getDiary = vi.mocked(SharedDiaryClient.getByShareId);
const origin = "https://memoir.test";
const url = (id: string) => `${origin}/shared/${id}`;
const diary = { title: "共有日記" } as SharedDiary;
function setup(input = url("share-a"), open = true) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        gcTime: 0,
      },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    client,
    ...renderHook(
      ({ input, open }) => useSharedDiarySearch(input, open, origin),
      { initialProps: { input, open }, wrapper },
    ),
  };
}
beforeEach(() => {
  getDiary.mockReset();
});

describe("useSharedDiarySearch", () => {
  it("共有ID単体から日記を取得する", async () => {
    getDiary.mockResolvedValue(diary);
    const shareId = "share-0e79b318-6695-490c-a680-50c00f34676d";
    const { result } = setup(shareId);

    await waitFor(() => expect(result.current.diary).toEqual(diary));
    expect(getDiary).toHaveBeenCalledExactlyOnceWith(shareId);
  });

  it("入力が安定するまで取得せず共有IDで取得する", async () => {
    getDiary.mockResolvedValue(diary);
    const { result } = setup();
    expect(getDiary).not.toHaveBeenCalled();
    expect(result.current.diary).toBeNull();
    await waitFor(() => expect(result.current.diary).toEqual(diary));
    expect(getDiary).toHaveBeenCalledExactlyOnceWith("share-a");
  });
  it.each([
    ["旅行", true],
    ["https://other.test/shared/a", true],
    [url("share-a"), false],
  ] as const)(
    "対象外の入力 %s と開閉状態 %s では取得しない",
    async (input, open) => {
      setup(input, open);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });
      expect(getDiary).not.toHaveBeenCalled();
    },
  );
  it("URL変更後は前の取得結果を返さない", async () => {
    let resolveOld!: (value: SharedDiary) => void;
    getDiary
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce({ title: "次の日記" });
    const { result, rerender } = setup();
    await waitFor(() => expect(getDiary).toHaveBeenCalledWith("share-a"));
    rerender({ input: url("share-b"), open: true });
    await act(async () => {
      resolveOld(diary);
    });
    expect(result.current.diary).toBeNull();
    await waitFor(() => expect(result.current.diary?.title).toBe("次の日記"));
  });
  it("キャッシュがあっても再取得し共有停止なら未存在を返す", async () => {
    getDiary.mockResolvedValue(null);
    const { client, result } = setup();
    client.setQueryData(sharedDiaryQueryKeys.byShareId("share-a"), diary);
    expect(result.current.diary).toBeNull();
    await waitFor(() => expect(getDiary).toHaveBeenCalledWith("share-a"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.diary).toBeNull();
    expect(result.current.isError).toBe(false);
  });
  it("取得失敗を返し再試行で回復する", async () => {
    getDiary
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(diary);
    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.diary).toBeNull();
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.diary).toEqual(diary));
  });
});
