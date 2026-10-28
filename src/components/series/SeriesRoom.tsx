import Link from "next/link";
import { href, text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Citations } from "@/lib/citations";
import { getArtworksInSeries } from "@/lib/artworks/queries";
import type { Series } from "@/lib/artworks/types";
import { getQuote } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { seriesPath } from "@/lib/paths";
import { SeriesHang } from "../art/SeriesHang";
import { Badge } from "../editor/Badge";
import { LightRays } from "../room/LightRays";
import { Cite } from "../text/Cite";
import { Facts } from "../text/Facts";
import { Quote } from "../text/Quote";
import { T } from "../text/T";
import styles from "./series.module.css";

/**
 * A series as a room on the home page: its hang follows the series' composition and its
 * surroundings follow its room. Facts and the artist's words sit beside the works, not under them.
 */
export async function SeriesRoom({
  series: s,
  locale,
  cites,
  headingLevel = 3,
}: {
  series: Series;
  locale: Locale;
  cites: Citations;
  /** 3 inside the "Цикли" section, 2 for a room that stands on its own. */
  headingLevel?: 2 | 3;
}) {
  const t = getDictionary(locale);
  const Heading = `h${headingLevel}` as const;
  const limit = s.composition === "salon" ? 12 : s.composition === "wall" ? 2 : 8;
  const works = await getArtworksInSeries(s.id, limit);
  const quote = s.quotes?.map(getQuote).find((q) => q !== undefined);
  const facts = quote ? s.facts?.slice(0, 1) : s.facts?.slice(0, 2);
  const id = `cikal-${s.slug}`;

  return (
    <section className={styles.room} data-composition={s.composition} data-room={s.room ?? "hall"} aria-labelledby={id}>
      {s.composition === "stage" && <LightRays at={[24, 71]} />}
      <header className={styles.header}>
        <Heading id={id} className={styles.title}>
          <Link href={href(locale, seriesPath(s))}>
            <T value={s.title} locale={locale} />
          </Link>
          <Badge verification={s.verification} locale={locale} />
        </Heading>
        {s.period && <p className={styles.period}>{formatDate(s.period.start, locale)}</p>}
        {s.summary && (
          <p className={styles.summary}>
            <T value={s.summary} locale={locale} />
            <Cite ids={s.verification.sources} cites={cites} />
          </p>
        )}
        <Facts facts={facts} locale={locale} cites={cites} />
        <p className={styles.more}>
          <Link href={href(locale, seriesPath(s))}>{s.kind === "practice" ? t.home.toPractice : t.home.toSeries}</Link>
        </p>
      </header>
      {quote && (
        <div className={styles.quote}>
          <Quote quote={quote} locale={locale} cites={cites} />
        </div>
      )}
      <div className={styles.hang}>
        <SeriesHang artworks={works} composition={s.composition} locale={locale} label={text(s.title, locale)} />
      </div>
    </section>
  );
}
