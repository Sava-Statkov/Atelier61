import type { ImageAsset, Verification } from "@/content/types";

/**
 * Which content is shown.
 * - "published" (default in production): only confirmed records and sourced records with a source.
 * - "all" (default in development): everything, with editor badges and notes.
 * Override with CONTENT_MODE=published|all, e.g. to preview the public site locally.
 */
export const contentMode: "published" | "all" =
  process.env.CONTENT_MODE === "published" || process.env.CONTENT_MODE === "all"
    ? process.env.CONTENT_MODE
    : process.env.NODE_ENV === "production"
      ? "published"
      : "all";

export const showEditorNotes = contentMode === "all";

export function isPublishable(v: Verification): boolean {
  if (v.status === "confirmed") return true;
  if (v.status === "sourced") return (v.sources?.length ?? 0) > 0;
  return false;
}

export function isVisible(v: Verification): boolean {
  return contentMode === "all" || isPublishable(v);
}

/** Images of unknown provenance are never published. */
export function isImagePublishable(image: ImageAsset): boolean {
  return image.rights === "artist" || image.rights === "licensed";
}

export function visible<T extends { verification: Verification }>(items: T[]): T[] {
  return items.filter((item) => isVisible(item.verification));
}
