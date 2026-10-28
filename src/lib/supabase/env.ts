/**
 * Address and publishable (anon) key of the Supabase project. Both are public by design: they reach
 * every visitor's browser, and row level security decides what each role may read or write.
 * Written out literally, so Next.js inlines them into the browser bundle.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example).",
  );
}

export const supabaseUrl = url;
export const supabaseKey = key;

/** The storage bucket with the photographs of the works. */
export const ARTWORKS_BUCKET = "artworks";

/** Public address of a photograph in the artworks bucket. */
export function photoUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${ARTWORKS_BUCKET}/${storagePath}`;
}
