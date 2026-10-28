import { exhibitions } from "@/content/exhibitions";
import { films } from "@/content/films";
import { quotes } from "@/content/quotes";
import { sources } from "@/content/sources";
import { stories } from "@/content/stories";
import { timeline } from "@/content/timeline";
import type { DateRange, Exhibition, LifeEvent, PartialDate, Story } from "@/content/types";
import { sortKey } from "./dates";
import { contentMode, isVisible, visible } from "./publish";

/**
 * The only way pages read the editorial content (src/content). Everything returned here has already
 * passed the publishing rules, so components never need to check verification themselves.
 * Works, their photographs and the cycles come from the database: see src/lib/artworks/queries.ts.
 */

export function getQuote(id: string) {
  const q = quotes.find((x) => x.id === id);
  return q && isVisible(q.verification) ? q : undefined;
}

export function getSource(id: string) {
  return sources.find((s) => s.id === id);
}

export function getExhibition(id: string) {
  const e = exhibitions.find((x) => x.id === id);
  return e && isVisible(e.verification) ? e : undefined;
}

export function getExhibitions(): Exhibition[] {
  return visible(exhibitions).sort((a, b) => sortKey(a.dates) - sortKey(b.dates));
}

export function isStoryVisible(s: Story) {
  return isVisible(s.verification) && (contentMode === "all" || s.editorial === "published");
}

export function getStories(): Story[] {
  return stories.filter(isStoryVisible);
}

export function getStory(slug: string) {
  return getStories().find((s) => s.slug === slug);
}

export function getStoriesFor(ref: { series?: string; artwork?: string }): Story[] {
  return getStories().filter(
    (s) =>
      (ref.series && s.series?.includes(ref.series)) ||
      (ref.artwork && (s.artworks?.includes(ref.artwork) || s.body.some((b) => b.type === "artwork" && b.slug === ref.artwork))),
  );
}

export function getFilms() {
  return visible(films);
}

export function getFilm(slug: string) {
  return getFilms().find((f) => f.slug === slug);
}

export type ChronicleEntry =
  | { kind: "event"; id: string; date?: PartialDate | DateRange; event: LifeEvent }
  | { kind: "exhibition"; id: string; date: DateRange; exhibition: Exhibition };

/** Life events and exhibitions in one chronological list; undated events come last. */
export function getChronicle(): ChronicleEntry[] {
  const entries: ChronicleEntry[] = [
    ...visible(timeline).map((event) => ({ kind: "event" as const, id: event.id, date: event.date, event })),
    ...getExhibitions().map((exhibition) => ({
      kind: "exhibition" as const,
      id: exhibition.id,
      date: exhibition.dates,
      exhibition,
    })),
  ];
  return entries.sort((a, b) => sortKey(a.date) - sortKey(b.date));
}

/** Exhibitions in which a work (by slug) was shown. */
export function getExhibitionsOf(artworkSlug: string): Exhibition[] {
  return getExhibitions().filter((e) => e.artworks?.includes(artworkSlug));
}

/** Collects the source ids cited by any set of records, in first-seen order. */
export function collectSources(...groups: Array<Array<{ verification: { sources?: string[] } } | undefined>>) {
  const ids = new Set<string>();
  for (const group of groups) for (const item of group) item?.verification.sources?.forEach((id) => ids.add(id));
  return [...ids].map(getSource).filter((s) => s !== undefined);
}
