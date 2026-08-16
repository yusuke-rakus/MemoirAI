import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { FavoriteMutationResult } from "../hooks/useSharedDiaryFavorite";

type SharedDiaryFavoriteButtonProps = {
  isFavorite: boolean;
  isLoading: boolean;
  isMutating: boolean;
  isAvailable: boolean;
  toggleFavorite: () => Promise<FavoriteMutationResult>;
};

type FavoriteAnimation = "idle" | Exclude<FavoriteMutationResult, null>;

const BURST_PARTICLES = [
  { x: 0, y: -14, className: "bg-favorite" },
  { x: 10, y: -10, className: "bg-primary" },
  { x: 14, y: 0, className: "bg-favorite" },
  { x: 10, y: 10, className: "bg-primary" },
  { x: 0, y: 14, className: "bg-favorite" },
  { x: -10, y: 10, className: "bg-primary" },
  { x: -14, y: 0, className: "bg-favorite" },
  { x: -10, y: -10, className: "bg-primary" },
] as const;

export const SharedDiaryFavoriteButton = ({
  isFavorite,
  isLoading,
  isMutating,
  isAvailable,
  toggleFavorite,
}: SharedDiaryFavoriteButtonProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [animation, setAnimation] = useState<FavoriteAnimation>("idle");
  const [burstSequence, setBurstSequence] = useState(0);
  const [isBursting, setIsBursting] = useState(false);
  const actionLabel = isFavorite ? "お気に入りから削除" : "お気に入りに追加";

  useEffect(() => {
    if (!isBursting) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsBursting(false), 650);

    return () => window.clearTimeout(timeoutId);
  }, [burstSequence, isBursting]);

  const handleToggle = async () => {
    const result = await toggleFavorite();

    if (!result) {
      return;
    }

    setAnimation(result);

    if (result === "added" && !shouldReduceMotion) {
      setBurstSequence((current) => current + 1);
      setIsBursting(true);
    } else {
      setIsBursting(false);
    }
  };

  const heartAnimation = shouldReduceMotion
    ? { scale: 1 }
    : animation === "added"
      ? { scale: [1, 0, 1.4, 0.9, 1] }
      : animation === "removed"
        ? { scale: [1, 0.8, 1] }
        : { scale: 1 };

  const heartTransition =
    animation === "added"
      ? { duration: 0.6, times: [0, 0.15, 0.55, 0.75, 1] }
      : animation === "removed"
        ? { duration: 0.2 }
        : { duration: 0 };

  return (
    <AppTooltip description={actionLabel}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative ml-auto rounded-full"
        aria-label={actionLabel}
        aria-pressed={isFavorite}
        aria-busy={isLoading || isMutating}
        disabled={isLoading || isMutating || !isAvailable}
        onClick={() => void handleToggle()}
      >
        {isBursting && !shouldReduceMotion && (
          <span
            key={burstSequence}
            data-slot="favorite-burst"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <motion.span
              data-slot="favorite-burst-ring"
              className="absolute top-1/2 left-1/2 -mt-2.5 -ml-2.5 size-5 rounded-full border-2 border-favorite"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 1, 0], scale: [0.2, 0.7, 1.35] }}
              transition={{ duration: 0.45, times: [0, 0.35, 1] }}
            />
            {BURST_PARTICLES.map((particle, index) => (
              <motion.span
                key={`${particle.x}-${particle.y}`}
                data-slot="favorite-burst-particle"
                className={cn(
                  "absolute top-1/2 left-1/2 -mt-0.5 -ml-0.5 size-1 rounded-full",
                  particle.className,
                )}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: particle.x,
                  y: particle.y,
                }}
                transition={{
                  delay: 0.08 + index * 0.008,
                  duration: 0.45,
                }}
              />
            ))}
          </span>
        )}
        <motion.span
          data-slot="favorite-heart"
          data-animation={animation}
          aria-hidden="true"
          initial={false}
          animate={heartAnimation}
          transition={shouldReduceMotion ? { duration: 0 } : heartTransition}
          className="relative z-10 inline-flex"
        >
          <Heart
            className={cn(
              "transition-colors duration-200 motion-reduce:transition-none",
              isFavorite
                ? "fill-favorite text-favorite"
                : "fill-transparent text-muted-foreground",
            )}
          />
        </motion.span>
      </Button>
    </AppTooltip>
  );
};
