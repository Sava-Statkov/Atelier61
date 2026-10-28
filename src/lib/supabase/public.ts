import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * The client for what visitors may see, on the server and in the browser. It keeps no session and
 * sends no cookies, so it reads exactly what row level security allows the public: published works.
 */
export const publicClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
