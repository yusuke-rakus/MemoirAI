import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { favoriteQueryKeys } from "@/lib/query/queryKeys";
import { FavoriteClient } from "@/lib/service/favoriteClient";

type UseSharedDiaryFavoriteParams = {
  uid?: string | null;
  sharedDiaryId?: string | null;
};

export type FavoriteMutationResult = "added" | "removed" | null;

export const useSharedDiaryFavorite = ({
  uid,
  sharedDiaryId,
}: UseSharedDiaryFavoriteParams) => {
  const queryClient = useQueryClient();
  const mutationInFlightRef = useRef(false);
  const query = useQuery({
    queryKey: favoriteQueryKeys.byShareId(uid ?? "", sharedDiaryId ?? ""),
    enabled: Boolean(uid && sharedDiaryId),
    queryFn: () => FavoriteClient.exists(uid!, sharedDiaryId!),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!uid || !sharedDiaryId) return null;
      if (query.data) {
        await FavoriteClient.delete(uid, sharedDiaryId);
        return "removed" as const;
      }
      await FavoriteClient.add(uid, sharedDiaryId);
      return "added" as const;
    },
    onSuccess: async (result) => {
      if (!uid || !sharedDiaryId || !result) return;
      queryClient.setQueryData(
        favoriteQueryKeys.byShareId(uid, sharedDiaryId),
        result === "added",
      );
      await queryClient.invalidateQueries({
        queryKey: favoriteQueryKeys.list(uid),
        refetchType: "all",
      });
    },
  });

  const isAvailable = !query.isError;

  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch favorite", query.error);
      toast.error("お気に入り状態の取得に失敗しました");
    }
  }, [query.error]);

  const toggleFavorite = async (): Promise<FavoriteMutationResult> => {
    if (
      !uid ||
      !sharedDiaryId ||
      query.isLoading ||
      !isAvailable ||
      mutation.isPending ||
      mutationInFlightRef.current
    ) {
      return null;
    }

    mutationInFlightRef.current = true;
    try {
      return await mutation.mutateAsync();
    } catch (error) {
      console.error("Failed to update favorite", error);
      toast.error("お気に入りの更新に失敗しました");
      return null;
    } finally {
      mutationInFlightRef.current = false;
    }
  };

  return {
    isFavorite: query.data ?? false,
    isLoading: query.isLoading && Boolean(uid && sharedDiaryId),
    isMutating: mutation.isPending,
    isAvailable,
    toggleFavorite,
  };
};
