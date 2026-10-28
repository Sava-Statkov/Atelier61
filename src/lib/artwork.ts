import type { Artwork, ImageAsset } from "@/content/types";
import { getMedia, type MediaInfo } from "./media";

/** Default proportion for a work that has no photograph and no stated size. */
const FALLBACK_RATIO = 0.8;

export type ResolvedImage = ImageAsset & MediaInfo;

/** The main photograph with its dimensions, if the file exists in public/media. */
export function mainImage(a: Artwork): ResolvedImage | undefined {
  const image = a.images[0];
  const info = image && getMedia(image.src);
  return image && info ? { ...image, ...info } : undefined;
}

/** Width / height: from the photograph, else the stated size, else the placeholder ratio. */
export function ratioOf(a: Artwork): number {
  const image = mainImage(a);
  if (image) return image.width / image.height;
  if (a.dimensions) return a.dimensions.widthCm / a.dimensions.heightCm;
  return a.placeholderRatio ?? FALLBACK_RATIO;
}

export function resolveImage(image: ImageAsset): ResolvedImage | undefined {
  const info = getMedia(image.src);
  return info ? { ...image, ...info } : undefined;
}
