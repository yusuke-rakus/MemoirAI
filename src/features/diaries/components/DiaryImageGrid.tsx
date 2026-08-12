import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { getDiaryImageAspectRatio } from "@/lib/getDiaryImageAspectRatio";
import { cn } from "@/lib/utils";
import type { DiaryImage } from "@/types/diary/diary";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DiaryImagePreviewDialog } from "./DiaryImagePreviewDialog";

type DiaryImageGridProps = {
  images?: DiaryImage[];
};

export const DiaryImageGrid = ({ images }: DiaryImageGridProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
    null,
  );
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
  const selectedImage = images[selectedIndex] ?? images[0];

  const handleImageClick = (index: number) => {
    setPreviewImageIndex(index);
  };

  const handlePreviewOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewImageIndex(null);
    }
  };

  return (
    <>
      <section className="space-y-2" aria-label="日記の画像">
        <div className="relative">
          <AspectRatio
            ratio={getDiaryImageAspectRatio(selectedImage)}
            className="bg-muted"
          >
            <div ref={emblaRef} className="h-full overflow-hidden">
              <div className="flex h-full">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="h-full min-w-0 flex-[0_0_100%]"
                  >
                    <button
                      type="button"
                      className="block h-full w-full cursor-zoom-in bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`${index + 1}枚目の画像を拡大表示`}
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={image.downloadURL}
                        alt={`日記の画像 ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform hover:scale-[1.01]"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </AspectRatio>

          {hasMultipleImages && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-sm hover:bg-background"
                aria-label="前の画像を表示"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-sm hover:bg-background"
                aria-label="次の画像を表示"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute right-2 bottom-2 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm">
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

      <DiaryImagePreviewDialog
        images={images}
        initialIndex={previewImageIndex ?? 0}
        isOpen={previewImageIndex !== null}
        onOpenChange={handlePreviewOpenChange}
      />
    </>
  );
};
