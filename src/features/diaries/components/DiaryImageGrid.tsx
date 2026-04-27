import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiaryImage } from "@/types/diary/diary";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type DiaryImageGridProps = {
  images?: DiaryImage[];
};

export const DiaryImageGrid = ({ images }: DiaryImageGridProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: (images?.length ?? 0) > 1,
  });

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateSelectedIndex();
    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  if (!images || images.length === 0) return null;

  const hasMultipleImages = images.length > 1;

  return (
    <section className="space-y-2" aria-label="日記の画像">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden bg-muted">
          <div className="flex">
            {images.map((image, index) => (
              <div key={image.id} className="min-w-0 flex-[0_0_100%]">
                <img
                  src={image.downloadURL}
                  alt={`日記の画像 ${index + 1}`}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {hasMultipleImages && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-sm hover:bg-background"
              aria-label="前の画像を表示"
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-sm hover:bg-background"
              aria-label="次の画像を表示"
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm">
              {selectedIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="flex justify-center gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-all",
                selectedIndex === index && "w-4 bg-primary",
              )}
              aria-current={selectedIndex === index}
              onClick={() => emblaApi?.scrollTo(index)}
            >
              <span className="sr-only">{index + 1}枚目の画像を表示</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
