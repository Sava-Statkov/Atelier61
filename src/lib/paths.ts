import type { SeriesText } from "@/content/types";

/**
 * Address of a series page, without locale prefix: cycles live under /cikli/, practices (ways of
 * working such as painting live with musicians) have an address of their own.
 */
export function seriesPath(s: Pick<SeriesText, "slug" | "kind">): string {
  return s.kind === "practice" ? `/${s.slug}` : `/cikli/${s.slug}`;
}
