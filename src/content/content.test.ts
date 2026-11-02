import { describe, expect, it } from "vitest";
import { exhibitions } from "./exhibitions";
import { films } from "./films";
import { futureIdeas } from "./ideas";
import { quotes } from "./quotes";
import { series } from "./series";
import { biography } from "./site";
import { sources } from "./sources";
import { stories } from "./stories";
import { timeline } from "./timeline";
import type { Verification } from "./types";

/**
 * Integrity of the editorial content: every reference points to something that exists, and nothing
 * marked as published lacks a source. Run with `npm test` after editing content. References to works
 * (by slug) point into the database and are checked by `npm run check:refs`.
 */
const sourceIds = new Set(sources.map((s) => s.id));
const seriesSlugs = new Set(series.map((s) => s.slug));
const exhibitionIds = new Set(exhibitions.map((e) => e.id));
const quoteIds = new Set(quotes.map((q) => q.id));
const storySlugs = new Set(stories.map((s) => s.slug));

const verifications: Array<[string, Verification]> = [
  ...series.map((s) => [`series ${s.slug}`, s.verification] as [string, Verification]),
  ...series.flatMap((s) => (s.facts ?? []).map((f, i) => [`series ${s.slug} fact ${i}`, f.verification] as [string, Verification])),
  ...exhibitions.map((e) => [`exhibition ${e.id}`, e.verification] as [string, Verification]),
  ...futureIdeas.map((i) => [`idea ${i.id}`, i.verification] as [string, Verification]),
  ...timeline.map((e) => [`event ${e.id}`, e.verification] as [string, Verification]),
  ...quotes.map((q) => [`quote ${q.id}`, q.verification] as [string, Verification]),
  ...films.map((f) => [`film ${f.slug}`, f.verification] as [string, Verification]),
  ...stories.map((s) => [`story ${s.slug}`, s.verification] as [string, Verification]),
  ...biography.map((b, i) => [`biography ${i}`, b.verification] as [string, Verification]),
];

const unique = (list: string[]) => list.length === new Set(list).size;

describe("content", () => {
  it("has unique ids and slugs", () => {
    expect(unique(series.map((s) => s.slug))).toBe(true);
    expect(unique(exhibitions.map((e) => e.id))).toBe(true);
    expect(unique(timeline.map((e) => e.id))).toBe(true);
    expect(unique(quotes.map((q) => q.id))).toBe(true);
    expect(unique(sources.map((s) => s.id))).toBe(true);
    expect(unique(stories.map((s) => s.slug))).toBe(true);
  });

  it("uses URL-safe slugs", () => {
    for (const slug of [...seriesSlugs, ...storySlugs]) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const e of [...exhibitions, ...timeline]) for (const a of e.artworks ?? []) expect(a).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("cites only known sources, and every sourced record cites at least one", () => {
    for (const [what, v] of verifications) {
      for (const id of v.sources ?? []) expect(sourceIds.has(id), `${what} → unknown source ${id}`).toBe(true);
      if (v.status === "sourced") expect(v.sources?.length ?? 0, `${what} is "sourced" without a source`).toBeGreaterThan(0);
    }
    for (const q of quotes) expect(sourceIds.has(q.source), `quote ${q.id}`).toBe(true);
  });

  it("references existing records", () => {
    for (const s of series) {
      for (const q of s.quotes ?? []) expect(quoteIds.has(q), `series ${s.slug} → quote ${q}`).toBe(true);
      for (const e of s.exhibitions ?? []) expect(exhibitionIds.has(e), `series ${s.slug} → exhibition ${e}`).toBe(true);
    }
    for (const e of [...timeline, ...exhibitions]) {
      for (const s of e.series ?? []) expect(seriesSlugs.has(s), `${e.id} → series ${s}`).toBe(true);
    }
    for (const st of stories) {
      for (const b of st.body) {
        if (b.type === "quote") expect(quoteIds.has(b.quote), `story ${st.slug} → quote ${b.quote}`).toBe(true);
        if (b.type === "p") for (const id of b.sources ?? []) expect(sourceIds.has(id)).toBe(true);
      }
      if (st.opening.kind === "quote") expect(quoteIds.has(st.opening.quote)).toBe(true);
    }
  });

});
