import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { DiaryImage } from "@/types/diary/diary";
import { useCallback, useEffect, useState } from "react";

type DiaryImagePreviewDialogProps = {
  images: DiaryImage[];
  initialIndex: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const PREVIEW_MARGIN = 32;

const getViewportSize = () => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const getPreviewWidth = (
  image: DiaryImage | undefined,
  viewportSize: { width: number; height: number },
) => {
  if (!image) return 0;

  const maxWidth = Math.max(viewportSize.width - PREVIEW_MARGIN, 0);
  const maxHeight = Math.max(viewportSize.height - PREVIEW_MARGIN, 0);
  const widthByHeight = maxHeight * (image.width / image.height);

  return Math.min(maxWidth, widthByHeight);
};

export const DiaryImagePreviewDialog = ({
  images,
  initialIndex,
  isOpen,
  onOpenChange,
}: DiaryImagePreviewDialogProps) => {
  const initialSlideIndex = Math.min(
    Math.max(initialIndex, 0),
    Math.max(images.length - 1, 0),
  );
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(initialSlideIndex);
  const [viewportSize, setViewportSize] = useState(getViewportSize);

  const updateSelectedIndex = useCallback(() => {
    if (!carouselApi) return;

    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!isOpen) return;

    const updateViewportSize = () => {
      setViewportSize(getViewportSize());
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!carouselApi) return;

    updateSelectedIndex();
    carouselApi.on("select", updateSelectedIndex);
    carouselApi.on("reInit", updateSelectedIndex);

    return () => {
      carouselApi.off("select", updateSelectedIndex);
      carouselApi.off("reInit", updateSelectedIndex);
    };
  }, [carouselApi, updateSelectedIndex]);

  useEffect(() => {
    if (!carouselApi || !isOpen) return;

    carouselApi.scrollTo(initialSlideIndex, true);
    setSelectedIndex(initialSlideIndex);
  }, [carouselApi, initialSlideIndex, isOpen]);

  if (images.length === 0) return null;

  const selectedImage = images[selectedIndex] ?? images[initialSlideIndex];
  const previewWidth = getPreviewWidth(selectedImage, viewportSize);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-fit w-fit max-w-[calc(100vw-2rem)] overflow-hidden border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:hidden">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "center",
            loop: images.length > 1,
            startIndex: initialSlideIndex,
          }}
          className="w-fit max-w-[calc(100vw-2rem)]"
          style={{
            width: previewWidth > 0 ? `${previewWidth}px` : undefined,
          }}
        >
          <CarouselContent className="ml-0 h-full">
            {images.map((image, index) => (
              <CarouselItem
                key={image.id}
                className="flex basis-full items-center justify-center pl-0"
              >
                <img
                  src={image.downloadURL}
                  alt={`日記の画像 ${index + 1}`}
                  className="max-h-[calc(100svh-2rem)] w-full object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};
