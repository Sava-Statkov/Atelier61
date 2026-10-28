import type { DateRange, PartialDate } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export function isRange(d: PartialDate | DateRange): d is DateRange {
  return "start" in d;
}

export function startOf(d: PartialDate | DateRange): PartialDate {
  return isRange(d) ? d.start : d;
}

/** Sortable number, e.g. 2007-04-03 → 20070403. Unknown month/day sort first within the year. */
export function sortKey(d: PartialDate | DateRange | undefined): number {
  if (!d) return Number.POSITIVE_INFINITY;
  const s = startOf(d);
  return s.year * 10000 + (s.month ?? 0) * 100 + (s.day ?? 0);
}

function part(d: PartialDate, locale: Locale, withYear: boolean): string {
  const months = getDictionary(locale).months;
  const bits: string[] = [];
  if (d.day && d.month) bits.push(String(d.day));
  if (d.month) bits.push(months[d.month - 1]);
  if (withYear) bits.push(locale === "bg" ? `${d.year} г.` : String(d.year));
  return bits.join(" ");
}

/** "23 април 1961 г.", "3–14 април 2007 г.", "около 1995 г.", "до 9 февруари 2026 г." */
export function formatDate(d: PartialDate | DateRange, locale: Locale): string {
  const t = getDictionary(locale).label;
  const approx = (p: PartialDate) => (p.approximate ? `${t.approximately} ` : "");

  if (!isRange(d) || !d.end) {
    const s = startOf(d);
    return approx(s) + part(s, locale, true);
  }

  const { start, end } = d;
  // An approximate start with a known end reads better as "до …".
  if (start.approximate && !end.approximate) return `${t.until} ${part(end, locale, true)}`;

  if (start.year === end.year && start.month && start.month === end.month && start.day && end.day) {
    return `${start.day}–${part(end, locale, true)}`;
  }
  const sameYear = start.year === end.year;
  return `${approx(start)}${part(start, locale, !sameYear)} – ${part(end, locale, true)}`;
}

export function yearOf(d: PartialDate | DateRange | undefined): number | undefined {
  return d ? startOf(d).year : undefined;
}
