import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * The admin's client in the browser, sharing the session cookies with the server. Used to upload
 * photographs straight to storage, so large files never pass through the Next.js server.
 */
export function getBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
