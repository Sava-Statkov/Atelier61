import type { Localized, SeriesText } from "@/content/types";

/** A photograph of a work, stored in Supabase Storage. */
export type Photo = {
  url: string;
  width: number;
  height: number;
  /** What the photograph shows. Without it, the work's title stands in. */
  alt: string | null;
  credit: string | null;
  /** Tiny blurred preview shown while the photograph loads. */
  blur: string | null;
};

/** A category or a cycle as attached to a work. */
export type Term = { id: string; slug: string; name: Localized };

/**
 * A published work as the pages use it. Anything not known yet is null and is simply not shown;
 * nothing is filled in by guessing. Texts are Bulgarian; `Localized` keeps room for English.
 */
export type Artwork = {
  id: string;
  slug: string;
  title: Localized | null;
  year: number | null;
  /** Exactly as the artist states it, e.g. "масло върху платно". */
  technique: Localized | null;
  description: Localized | null;
  dimensions: { heightCm: number; widthCm: number; depthCm: number | null } | null;
  category: Term | null;
  cycle: Term | null;
  /** Ids from src/content/sources.ts. */
  sources: string[];
  /** In order, the first is the main view. Lists load only the first. */
  photos: Photo[];
  /** Position in the order set in the admin; also the cursor for loading more. */
  sortOrder: number;
};

/**
 * A cycle: its name, description and representative work come from the database, its sourced facts,
 * quotes and presentation from src/content/series.ts (matched by slug).
 */
export type Series = SeriesText & {
  id: string;
  title: Localized;
  summary: Localized | null;
  featuredArtworkId: string | null;
};
