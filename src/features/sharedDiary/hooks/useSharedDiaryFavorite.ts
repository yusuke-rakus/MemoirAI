import { FavoriteClient } from "@/lib/service/favoriteClient";
import { requestFavoriteRefresh } from "@/stores/favoriteRefreshStore";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UseSharedDiaryFavoriteParams = {
  uid?: string | null;
  sharedDiaryId?: string | null;
};

export type FavoriteMutationResult = "added" | "removed" | null;

export const useSharedDiaryFavorite = ({
  uid,
  sharedDiaryId,
}: UseSharedDiaryFavoriteParams) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const mutationInFlightRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    if (!uid || !sharedDiaryId) {
      setIsFavorite(false);
      setIsLoading(false);
      setIsAvailable(true);
      return () => {
        isActive = false;
      };
    }

    const fetchFavorite = async () => {
      setIsLoading(true);
      setIsAvailable(true);

      try {
        const exists = await FavoriteClient.exists(uid, sharedDiaryId);
        if (isActive) {
          setIsFavorite(exists);
        }
      } catch (error) {
        console.error("Failed to fetch favorite", error);
        if (isActive) {
          setIsAvailable(false);
          toast.error("お気に入り状態の取得に失敗しました");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchFavorite();

    return () => {
      isActive = false;
    };
  }, [sharedDiaryId, uid]);

  const toggleFavorite = async (): Promise<FavoriteMutationResult> => {
    if (
      !uid ||
      !sharedDiaryId ||
      isLoading ||
      !isAvailable ||
      mutationInFlightRef.current
    ) {
      return null;
    }

    mutationInFlightRef.current = true;
    setIsMutating(true);

    try {
      if (isFavorite) {
        await FavoriteClient.delete(uid, sharedDiaryId);
        setIsFavorite(false);
        requestFavoriteRefresh();
        return "removed";
      } else {
        await FavoriteClient.add(uid, sharedDiaryId);
        setIsFavorite(true);
        requestFavoriteRefresh();
        return "added";
      }
    } catch (error) {
      console.error("Failed to update favorite", error);
      toast.error("お気に入りの更新に失敗しました");
      return null;
    } finally {
      mutationInFlightRef.current = false;
      setIsMutating(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    isMutating,
    isAvailable,
    toggleFavorite,
  };
};
