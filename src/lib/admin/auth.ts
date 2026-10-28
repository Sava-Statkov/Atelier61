import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionClient } from "@/lib/supabase/server";

/**
 * The signed-in admin and a database client acting as them. Anyone else is sent to the sign-in
 * page. Every admin page and every Server Action calls this first; row level security in the
 * database checks the same role again, so a forged request gets nowhere either way.
 */
export const requireAdmin = cache(async () => {
  const db = await getSessionClient();
  const { data } = await db.auth.getClaims();
  const claims = data?.claims;
  if (!claims || claims.app_metadata?.role !== "admin") redirect("/admin/login");
  return { db, email: typeof claims.email === "string" ? claims.email : undefined };
});
