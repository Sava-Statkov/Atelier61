import type { QueryData, SupabaseClient } from "@supabase/supabase-js";
import type { Localized } from "@/content/types";
import { getDictionary } from "@/i18n/dictionaries";
import type { Database } from "@/lib/supabase/database.types";
import { photoUrl } from "@/lib/supabase/env";
import type { Artwork, Term } from "./types";

/**
 * How the site reads works from the database. Shared by the server (first page, cached) and the
 * browser (the next pages of the gallery), so both see exactly the same data.
 */

type Db = SupabaseClient<Database>;

/** Works per page of the gallery. */
export const PAGE_SIZE = 24;

// One literal, so supabase-js can type the result. Two relations link works and cycles (a work's
// cycle, a cycle's representative work), so the one meant here is named.
const COLUMNS = `id, slug, title, year, technique, description, height_cm, width_cm, depth_cm, sources, sort_order,
  category:categories(id, slug, name),
  cycle:cycles!artworks_cycle_id_fkey(id, slug, name),
  photos:artwork_images(storage_path, width, height, alt, credit, blur_data_url, sort_order)`;

/** Published works in the order set in the admin, photographs in their own order. */
export function selectArtworks(db: Db) {
  return db
    .from("artworks")
    .select(COLUMNS)
    .eq("published", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "photos" });
}

type ArtworkRow = QueryData<ReturnType<typeof selectArtworks>>[number];

const localized = (value: string | null) => (value ? { bg: value } : null);
const term = (row: { id: string; slug: string; name: string } | null): Term | null =>
  row ? { id: row.id, slug: row.slug, name: { bg: row.name } } : null;

export function toArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    slug: row.slug,
    title: localized(row.title),
    year: row.year,
    technique: localized(row.technique),
    description: localized(row.description),
    dimensions:
      row.height_cm && row.width_cm
        ? { heightCm: Number(row.height_cm), widthCm: Number(row.width_cm), depthCm: row.depth_cm ? Number(row.depth_cm) : null }
        : null,
    category: term(row.category),
    cycle: term(row.cycle),
    sources: row.sources,
    photos: row.photos.map((p) => ({
      url: photoUrl(p.storage_path),
      width: p.width,
      height: p.height,
      alt: p.alt,
      credit: p.credit,
      blur: p.blur_data_url,
    })),
    sortOrder: row.sort_order,
  };
}

export type GalleryQuery = {
  categoryId?: string | null;
  cycleId?: string | null;
  /** Left out of the list, e.g. the representative work already shown large above it. */
  excludeId?: string | null;
  /** Load the works after this position. */
  after?: number | null;
};

export type GalleryPage = { items: Artwork[]; next: number | null };

/** One page of the gallery: up to PAGE_SIZE works and the cursor for the next page, if any. */
export async function fetchGalleryPage(db: Db, q: GalleryQuery): Promise<GalleryPage> {
  let query = selectArtworks(db)
    .limit(1, { referencedTable: "photos" })
    .limit(PAGE_SIZE + 1);
  if (q.categoryId) query = query.eq("category_id", q.categoryId);
  if (q.cycleId) query = query.eq("cycle_id", q.cycleId);
  if (q.excludeId) query = query.neq("id", q.excludeId);
  if (q.after != null) query = query.gt("sort_order", q.after);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load works: ${error.message}`);
  const items = data.map(toArtwork);
  return items.length > PAGE_SIZE
    ? { items: items.slice(0, PAGE_SIZE), next: items[PAGE_SIZE - 1].sortOrder }
    : { items, next: null };
}

/** The title for links and headings, or "a work by Rumen Statkov" while the title is not known. */
export function nameOf(a: Artwork): Localized {
  return a.title ?? { bg: getDictionary("bg").artwork.untitled, en: getDictionary("en").artwork.untitled };
}

/** Default proportion for a work that has neither a photograph nor a known size. */
const FALLBACK_RATIO = 0.8;

/** Width / height: from the main photograph, else from the stated size, else a neutral default. */
export function ratioOf(a: Artwork): number {
  const photo = a.photos[0];
  if (photo) return photo.width / photo.height;
  if (a.dimensions) return a.dimensions.widthCm / a.dimensions.heightCm;
  return FALLBACK_RATIO;
}
