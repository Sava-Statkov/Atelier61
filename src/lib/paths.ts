import type { Series } from "@/content/types";

/**
 * Address of a series page, without locale prefix: cycles live under /cikli/, practices (ways of
 * working such as painting live with musicians) have an address of their own.
 * Also read by next.config.ts to redirect old /cikli/ addresses of practices, so keep this file
 * free of other imports.
 */
export function seriesPath(s: Pick<Series, "slug" | "kind">): string {
  return s.kind === "practice" ? `/${s.slug}` : `/cikli/${s.slug}`;
}
