import type { DiaryImage } from "@/types/diary/diary";

const LANDSCAPE_ASPECT_RATIO = 3 / 2;
const PORTRAIT_ASPECT_RATIO = 4 / 5;

export const getDiaryImageAspectRatio = (
  image: Pick<DiaryImage, "width" | "height">,
): number =>
  image.width > image.height ? LANDSCAPE_ASPECT_RATIO : PORTRAIT_ASPECT_RATIO;
