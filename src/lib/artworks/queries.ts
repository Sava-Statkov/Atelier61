import "server-only";
import { unstable_cache } from "next/cache";
import { series as seriesTexts } from "@/content/series";
import type { SeriesText } from "@/content/types";
import { isVisible } from "@/lib/publish";
import { supabaseUrl } from "@/lib/supabase/env";
import { publicClient } from "@/lib/supabase/public";
import { fetchGalleryPage, selectArtworks, toArtwork, type GalleryQuery } from "./map";
import type { Artwork, Series } from "./types";

/**
 * Everything the public pages read about the works, from the database. Results are cached and
 * tagged; the admin calls `revalidateTag(ARTWORKS_TAG, …)` after every change, so a published work
 * appears without a rebuild. The daily revalidation is only a safety net.
 */

export const ARTWORKS_TAG = "artworks";

const cached = <A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) =>
  // The database address is part of the key, so switching between the local and the production
  // database never serves the other one's cached data.
  unstable_cache(fn, ["artworks", supabaseUrl, key], { tags: [ARTWORKS_TAG], revalidate: 86400 });

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not load ${what}: ${error.message}`);
}

/** All categories, in their order. */
export const getCategories = cached("categories", async () => {
  const { data, error } = await publicClient.from("categories").select("id, slug, name").order("sort_order");
  if (error) fail("categories", error);
  return data;
});

const defaultText = (slug: string): SeriesText => ({ slug, composition: "salon", verification: { status: "confirmed" } });

/** Cycles in their order, each with its texts from src/content/series.ts. */
export const getSeriesList = cached("series", async (): Promise<Series[]> => {
  const { data, error } = await publicClient
    .from("cycles")
    .select("id, slug, name, description, featured_artwork_id")
    .order("sort_order");
  if (error) fail("cycles", error);
  return data
    .map((c) => ({
      ...(seriesTexts.find((t) => t.slug === c.slug) ?? defaultText(c.slug)),
      id: c.id,
      title: { bg: c.name },
      summary: c.description ? { bg: c.description } : null,
      featuredArtworkId: c.featured_artwork_id,
    }))
    .filter((s) => isVisible(s.verification));
});

export async function getSeries(slug: string): Promise<Series | undefined> {
  return (await getSeriesList()).find((s) => s.slug === slug);
}

/** A published work with all its photographs, or null. */
export const getArtwork = cached("artwork", async (slug: string): Promise<Artwork | null> => {
  const { data, error } = await selectArtworks(publicClient).eq("slug", slug).maybeSingle();
  if (error) fail(`work ${slug}`, error);
  return data ? toArtwork(data) : null;
});

/** A published work by id (e.g. a cycle's representative work), or null. */
export const getArtworkById = cached("artwork-id", async (id: string): Promise<Artwork | null> => {
  const { data, error } = await selectArtworks(publicClient).eq("id", id).maybeSingle();
  if (error) fail(`work ${id}`, error);
  return data ? toArtwork(data) : null;
});

/** The work on the home page wall, if one is chosen and published. */
export const getHomeArtwork = cached("home", async (): Promise<Artwork | null> => {
  const { data, error } = await selectArtworks(publicClient).eq("on_home", true).maybeSingle();
  if (error) fail("the home page work", error);
  return data ? toArtwork(data) : null;
});

/** Published works of a cycle in their order, each with its main photograph. */
export const getArtworksInSeries = cached("in-series", async (cycleId: string, limit?: number): Promise<Artwork[]> => {
  let query = selectArtworks(publicClient).eq("cycle_id", cycleId).limit(1, { referencedTable: "photos" });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) fail("the works of a cycle", error);
  return data.map(toArtwork);
});

/** Other works of the same cycle. */
export async function getRelatedArtworks(a: Artwork, limit = 6): Promise<Artwork[]> {
  if (!a.cycle) return [];
  return (await getArtworksInSeries(a.cycle.id, limit + 1)).filter((o) => o.id !== a.id).slice(0, limit);
}

/** The first page of the gallery; the browser loads the next ones itself (see components/gallery). */
export const getGalleryPage = cached("gallery", (q: GalleryQuery) => fetchGalleryPage(publicClient, q));

/** How many published works match a filter. */
export const countArtworks = cached("count", async (q: Pick<GalleryQuery, "categoryId" | "cycleId">): Promise<number> => {
  let query = publicClient.from("artworks").select("id", { count: "exact", head: true }).eq("published", true);
  if (q.categoryId) query = query.eq("category_id", q.categoryId);
  if (q.cycleId) query = query.eq("cycle_id", q.cycleId);
  const { count, error } = await query;
  if (error) fail("the number of works", error);
  return count ?? 0;
});

/** Categories and cycles that have at least one published work: the filters worth offering. */
export const getUsedTerms = cached("used-terms", async () => {
  const { data, error } = await publicClient.from("artworks").select("category_id, cycle_id").eq("published", true);
  if (error) fail("the filters", error);
  return {
    categoryIds: [...new Set(data.map((r) => r.category_id).filter((id): id is string => id !== null))],
    cycleIds: [...new Set(data.map((r) => r.cycle_id).filter((id): id is string => id !== null))],
  };
});

/** Slugs of all published works, for prerendering and the sitemap. */
export const getPublishedSlugs = cached("slugs", async (): Promise<string[]> => {
  const { data, error } = await publicClient.from("artworks").select("slug").eq("published", true).order("sort_order");
  if (error) fail("the list of works", error);
  return data.map((r) => r.slug);
});
