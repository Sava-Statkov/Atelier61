import { describe, expect, it } from "vitest";
import { publicClient } from "@/lib/supabase/public";
import { exhibitions } from "./exhibitions";
import { films } from "./films";
import { series } from "./series";
import { stories } from "./stories";
import { timeline } from "./timeline";

/**
 * The editorial content points to works and cycles in the database by slug. This checks that each
 * of them exists and that every work named is published (a draft would silently drop out of the page).
 */
describe("references to the database", async () => {
  const [works, cycles] = await Promise.all([
    publicClient.from("artworks").select("slug").eq("published", true),
    publicClient.from("cycles").select("slug"),
  ]);
  if (works.error || cycles.error) throw new Error(`database not reachable: ${(works.error ?? cycles.error)?.message}`);
  const workSlugs = new Set(works.data.map((w) => w.slug));
  const cycleSlugs = new Set(cycles.data.map((c) => c.slug));

  it("names only published works", () => {
    const refs: Array<[string, string]> = [
      ...exhibitions.flatMap((e) => (e.artworks ?? []).map((a): [string, string] => [`exhibition ${e.id}`, a])),
      ...timeline.flatMap((e) => (e.artworks ?? []).map((a): [string, string] => [`event ${e.id}`, a])),
      ...stories.flatMap((s) => [
        ...(s.artworks ?? []).map((a): [string, string] => [`story ${s.slug}`, a]),
        ...s.body.flatMap((b) => (b.type === "artwork" ? [[`story ${s.slug}`, b.slug] as [string, string]] : [])),
      ]),
      ...films.flatMap((f) => (f.chapters ?? []).flatMap((c) => (c.artworks ?? []).map((a): [string, string] => [`film ${f.slug}`, a]))),
    ];
    for (const [where, slug] of refs) expect(workSlugs.has(slug), `${where} → work ${slug}`).toBe(true);
  });

  it("names only existing cycles", () => {
    for (const s of series) expect(cycleSlugs.has(s.slug), `series.ts entry ${s.slug} has no cycle in the database`).toBe(true);
    const refs = [...exhibitions, ...timeline, ...stories].flatMap((r) => r.series ?? []);
    for (const slug of refs) expect(cycleSlugs.has(slug), `→ cycle ${slug}`).toBe(true);
  });
});
