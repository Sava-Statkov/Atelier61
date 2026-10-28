import manifest from "@/content/generated/media.json";

export type MediaInfo = {
  width: number;
  height: number;
  /** Tiny blurred preview as a data URL. */
  blur: string;
  /** Average colour, used behind the image while it loads. */
  color: string;
};

const media = manifest as Record<string, MediaInfo>;

/** Dimensions and preview for a file under /public, or `undefined` if the file is missing. */
export function getMedia(src: string): MediaInfo | undefined {
  return media[src];
}
