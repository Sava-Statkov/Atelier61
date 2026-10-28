import type { Source } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSource } from "./content";

/** Numbered sources for one page. Components receive it to render footnote numbers. */
export type Citations = { list: Source[]; number: (id: string) => number | undefined; label: string };

export function makeCitations(locale: Locale, ...idGroups: Array<Array<string | undefined> | undefined>): Citations {
  const ids: string[] = [];
  for (const group of idGroups) for (const id of group ?? []) if (id && !ids.includes(id)) ids.push(id);
  const list = ids.map(getSource).filter((s): s is Source => Boolean(s));
  const index = new Map(list.map((s, i) => [s.id, i + 1]));
  return { list, number: (id) => index.get(id), label: getDictionary(locale).sources.source };
}

/** All source ids referenced by records with a `verification`. */
export function sourceIds(...records: Array<{ verification: { sources?: string[] } } | undefined>): string[] {
  return records.flatMap((r) => r?.verification.sources ?? []);
}
