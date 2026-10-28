import Link from "next/link";
import type { Series } from "@/content/types";
import { href, text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { makeCitations, sourceIds } from "@/lib/citations";
import { getArtworksInSeries, getExhibition, getQuote, getStoriesFor } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { SeriesHang } from "../art/SeriesHang";
import { EditorNote } from "../editor/Badge";
import { LightRays } from "../room/LightRays";
import { Blocks } from "../text/Blocks";
import { Cite } from "../text/Cite";
import { Facts } from "../text/Facts";
import { Quote } from "../text/Quote";
import { SourceList } from "../text/SourceList";
import { T } from "../text/T";
import styles from "./seriesPage.module.css";

/** The page of a cycle (/cikli/…) or of a practice (its own address): works, facts, words, exhibitions. */
export function SeriesPage({ series: s, locale }: { series: Series; locale: Locale }) {
  const t = getDictionary(locale);
  const works = getArtworksInSeries(s.slug);
  const quotes = (s.quotes ?? []).map(getQuote).filter((q) => q !== undefined);
  const exhibitions = (s.exhibitions ?? []).map(getExhibition).filter((e) => e !== undefined);
  const stories = getStoriesFor({ series: s.slug });
  const cites = makeCitations(
    locale,
    sourceIds(s, ...(s.facts ?? []), ...exhibitions),
    quotes.map((q) => q.source),
  );

  return (
    <article data-room={s.room ?? "hall"} className={styles.series} data-composition={s.composition}>
      {s.composition === "stage" && <LightRays at={[30, 68]} />}
      <header className={`page ${styles.header}`}>
        <h1 className={styles.title}>
          <T value={s.title} locale={locale} />
        </h1>
        {s.period && <p className={styles.period}>{formatDate(s.period.start, locale)}</p>}
        <p className={styles.summary}>
          <T value={s.summary} locale={locale} />
          <Cite ids={s.verification.sources} cites={cites} />
        </p>
        <EditorNote locale={locale}>{s.verification.note}</EditorNote>
      </header>

      <div className={`page ${styles.hang}`}>
        <SeriesHang artworks={works} composition={s.composition} locale={locale} label={text(s.title, locale)} />
      </div>

      <div className={`page ${styles.body}`}>
        <div className={styles.facts}>
          <Facts facts={s.facts} locale={locale} cites={cites} />
          <Blocks blocks={s.body} locale={locale} cites={cites} />
        </div>
        {quotes.length > 0 && (
          <div className={styles.quotes}>
            {quotes.map((q) => (
              <Quote key={q.id} quote={q} locale={locale} cites={cites} />
            ))}
          </div>
        )}
      </div>

      {exhibitions.length > 0 && (
        <section className={`page ${styles.section}`} aria-labelledby="exhibitions">
          <h2 id="exhibitions" className={styles.sectionTitle}>
            {t.chronicle.exhibitions}
          </h2>
          <ol className={styles.exhibitions}>
            {exhibitions.map((e) => (
              <li key={e.id}>
                <p className={styles.exDate}>{formatDate(e.dates, locale)}</p>
                <p className={styles.exTitle}>
                  <T value={e.title} locale={locale} />
                </p>
                <p className={styles.exPlace}>
                  <T value={e.venue} locale={locale} />
                  {e.city && (
                    <>
                      , <T value={e.city} locale={locale} />
                    </>
                  )}
                  <Cite ids={e.verification.sources} cites={cites} />
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {stories.length > 0 && (
        <section className={`page ${styles.section}`} aria-labelledby="stories">
          <h2 id="stories" className={styles.sectionTitle}>
            {t.home.stories}
          </h2>
          <ul>
            {stories.map((st) => (
              <li key={st.slug}>
                <Link href={href(locale, `/istorii/${st.slug}`)}>
                  <T value={st.title} locale={locale} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="page">
        <SourceList cites={cites} locale={locale} />
      </div>
    </article>
  );
}

/** Title and description for a series page. */
export function seriesMetadata(s: Series, locale: Locale) {
  return { title: text(s.title, locale), description: text(s.summary, locale) };
}
