import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ARTWORKS_BUCKET } from "@/lib/supabase/env";
import type { PreparedPhoto } from "./image";

/**
 * Uploading from the admin's browser with the admin's session; row level security on storage and
 * on the tables lets only the admin through. Used by the work editor and by the bulk import.
 */

type Db = SupabaseClient<Database>;

/** The work a photograph already belongs to, recognised by the SHA-256 of its original file. */
export async function findByHash(db: Db, hash: string): Promise<{ artworkId: string } | null> {
  const { data, error } = await db.from("artwork_images").select("artwork_id").eq("source_hash", hash).maybeSingle();
  if (error) throw new Error(`Проверката за дубликат не успя: ${error.message}`);
  return data ? { artworkId: data.artwork_id } : null;
}

/**
 * Uploads the prepared file as "<hash>.<ext>". The address never changes, so it may be cached for a
 * year. A file that is already there (an earlier, interrupted import) counts as uploaded.
 */
export async function uploadPhoto(db: Db, photo: PreparedPhoto): Promise<string> {
  const path = `${photo.hash}.${photo.extension}`;
  const { error } = await db.storage.from(ARTWORKS_BUCKET).upload(path, photo.file, {
    contentType: photo.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error && !/already exists|duplicate/i.test(error.message) && (error as { statusCode?: string }).statusCode !== "409") {
    throw new Error(`Качването не успя: ${error.message}`);
  }
  return path;
}
