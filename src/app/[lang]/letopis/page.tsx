import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/editor/Badge";
import { Cite } from "@/components/text/Cite";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import { href, isEnabledLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { makeCitations, type Citations } from "@/lib/citations";
import { getArtwork, getChronicle, getSeries, type ChronicleEntry } from "@/lib/content";
import type { DateRange, PartialDate } from "@/content/types";
import { formatDate, isRange, yearOf } from "@/lib/dates";
import { seriesPath } from "@/lib/paths";
import pages from "../pages.module.css";
import styles from "./chronicle.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/letopis">): Promise<Metadata> {
  const { lang } = await params;
  return isEnabledLocale(lang) ? { title: getDictionary(lang).chronicle.title } : {};
}

function isBareYear(d: PartialDate | DateRange) {
  return !isRange(d) ? !d.month && !d.approximate : !d.end && !d.start.month && !d.start.approximate;
}

function Entry({ entry, locale, cites }: { entry: ChronicleEntry; locale: Locale; cites: Citations }) {
  const record = entry.kind === "event" ? entry.event : entry.exhibition;
  const seriesSlugs = record.series ?? [];
  const artworkSlugs = entry.kind === "event" ? entry.event.artworks ?? [] : entry.exhibition.artworks ?? [];
  const links = [
    ...seriesSlugs.map(getSeries).filter((s) => s !== undefined).map((s) => ({ href: href(locale, seriesPath(s)), title: s.title })),
    ...artworkSlugs.map(getArtwork).filter((a) => a !== undefined).map((a) => ({ href: href(locale, `/tvorbi/${a.slug}`), title: a.title })),
  ];

  return (
    <li className={styles.entry} data-kind={entry.kind}>
      {/* The year already heads the group; repeat the date only when it says more than the year. */}
      {entry.date && !isBareYear(entry.date) && <p className={styles.date}>{formatDate(entry.date, locale)}</p>}
      <p className={styles.title}>
        {entry.kind === "exhibition" ? (
          <>
            „<T value={entry.exhibition.title} locale={locale} />“
          </>
        ) : (
          <T value={entry.event.title} locale={locale} />
        )}
        <Cite ids={record.verification.sources} cites={cites} />
        <Badge verification={record.verification} locale={locale} />
      </p>
      {entry.kind === "exhibition" && (
        <p className={styles.place}>
          <T value={entry.exhibition.venue} locale={locale} />
          {entry.exhibition.city && (
            <>
              , <T value={entry.exhibition.city} locale={locale} />
            </>
          )}
          {entry.exhibition.country && (
            <>
              , <T value={entry.exhibition.country} locale={locale} />
            </>
          )}
        </p>
      )}
      {entry.kind === "exhibition" && entry.exhibition.summary && (
        <p className={styles.text}>
          <T value={entry.exhibition.summary} locale={locale} />
        </p>
      )}
      {entry.kind === "event" && entry.event.text && (
        <p className={styles.text}>
          <T value={entry.event.text} locale={locale} />
        </p>
      )}
      {links.length > 0 && (
        <p className={styles.links}>
          {links.map((l, i) => (
            <span key={l.href}>
              {i > 0 && ", "}
              <Link href={l.href}>
                <T value={l.title} locale={locale} />
              </Link>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export default async function ChroniclePage({ params }: PageProps<"/[lang]/letopis">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang).chronicle;

  const entries = getChronicle();
  const groups = new Map<number | "undated", ChronicleEntry[]>();
  for (const e of entries) {
    const key = yearOf(e.date) ?? "undated";
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  const cites = makeCitations(
    lang,
    entries.flatMap((e) => (e.kind === "event" ? e.event : e.exhibition).verification.sources ?? []),
  );

  return (
    <div className="page">
      <header className={pages.intro}>
        <h1 className={pages.pageTitle}>{t.title}</h1>
        <p className={pages.lead}>{t.intro}</p>
      </header>
      <ol className={styles.years}>
        {[...groups].map(([year, list]) => (
          <li key={year} id={`g-${year}`} className={styles.year}>
            <h2 className={styles.yearLabel}>{year === "undated" ? t.undated : year}</h2>
            <ol className={styles.entries}>
              {list.map((e) => (
                <Entry key={e.id} entry={e} locale={lang} cites={cites} />
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <SourceList cites={cites} locale={lang} />
    </div>
  );
}
