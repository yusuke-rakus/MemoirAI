import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { sharedDiaryQueryKeys } from "@/lib/query/queryKeys";
import { SharedDiaryClient } from "@/lib/service/sharedDiaryClient";
import type { SharedDiary } from "@/types/diary/sharedDiary";

import { parseSharedDiaryUrl } from "../lib/sharedDiaryUrl";

export function useSharedDiarySearch(
  input: string,
  open: boolean,
  origin: string,
) {
  const [settledInput, setSettledInput] = useState<string | null>(null);
  const url = parseSharedDiaryUrl(input, origin);
  useEffect(() => {
    setSettledInput(null);
    if (!open) return;
    const timer = window.setTimeout(() => setSettledInput(input), 200);
    return () => window.clearTimeout(timer);
  }, [input, open]);

  const enabled = open && input === settledInput && url.kind === "shared";
  const shareId = enabled ? url.shareId : "";
  const query = useQuery({
    queryKey: sharedDiaryQueryKeys.byShareId(shareId),
    queryFn: () => SharedDiaryClient.getByShareId<SharedDiary>(shareId),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const isLoading =
    url.kind === "shared" && (!enabled || query.isPending || query.isFetching);
  const isError = enabled && !isLoading && query.isError;
  return {
    url,
    isLoading,
    isError,
    diary: enabled && !isLoading && !isError ? (query.data ?? null) : null,
    retry: () => {
      if (enabled) void query.refetch();
    },
  };
}
