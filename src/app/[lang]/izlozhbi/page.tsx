import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/editor/Badge";
import { Cite } from "@/components/text/Cite";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import type { Exhibition } from "@/content/types";
import { href, isEnabledLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSeries } from "@/lib/artworks/queries";
import { makeCitations, sourceIds, type Citations } from "@/lib/citations";
import { getFutureIdeas, getPastExhibitions } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { seriesPath } from "@/lib/paths";
import pages from "../pages.module.css";
import styles from "./exhibitions.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/izlozhbi">): Promise<Metadata> {
  const { lang } = await params;
  return isEnabledLocale(lang) ? { title: getDictionary(lang).exhibitions.title } : {};
}

async function Row({ exhibition: e, locale, cites }: { exhibition: Exhibition; locale: Locale; cites: Citations }) {
  const series = (await Promise.all((e.series ?? []).map(getSeries))).filter((s) => s !== undefined);
  return (
    <li className={styles.row}>
      <p className={styles.date}>{formatDate(e.dates, locale)}</p>
      <div>
        <h3 className={styles.title}>
          <T value={e.title} locale={locale} />
          <Cite ids={e.verification.sources} cites={cites} />
          <Badge verification={e.verification} locale={locale} />
        </h3>
        <p className={styles.text}>
          <T value={e.venue} locale={locale} />
          {e.city && (
            <>
              , <T value={e.city} locale={locale} />
            </>
          )}
          {e.country && (
            <>
              , <T value={e.country} locale={locale} />
            </>
          )}
        </p>
        {e.summary && (
          <p className={styles.text}>
            <T value={e.summary} locale={locale} />
          </p>
        )}
        {series.length > 0 && (
          <p className={styles.links}>
            {series.map((s, i) => (
              <span key={s.slug}>
                {i > 0 && ", "}
                <Link href={href(locale, seriesPath(s))}>
                  <T value={s.title} locale={locale} />
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

export default async function ExhibitionsPage({ params }: PageProps<"/[lang]/izlozhbi">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang).exhibitions;

  const past = getPastExhibitions();
  const ideas = getFutureIdeas();
  const cites = makeCitations(lang, sourceIds(...past, ...ideas));

  return (
    <div className="page">
      <header className={pages.intro}>
        <h1 className={pages.pageTitle}>{t.title}</h1>
        <p className={pages.lead}>{t.intro}</p>
      </header>

      <section className={pages.section} aria-labelledby="past-heading">
        <h2 id="past-heading" className={pages.sectionTitle}>
          {t.past}
        </h2>
        <ol className={styles.list}>
          {past.map((e) => (
            <Row key={e.id} exhibition={e} locale={lang} cites={cites} />
          ))}
        </ol>
      </section>

      <section className={pages.section} aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className={pages.sectionTitle}>
          {t.ideas}
        </h2>
        {ideas.length > 0 ? (
          <ul className={styles.list}>
            {ideas.map((idea) => (
              <li key={idea.id} className={styles.idea}>
                <h3 className={styles.title}>
                  <T value={idea.title} locale={lang} />
                  <Cite ids={idea.verification.sources} cites={cites} />
                </h3>
                {idea.text && (
                  <p className={styles.text}>
                    <T value={idea.text} locale={lang} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={pages.subtle}>{t.ideasPending}</p>
        )}
      </section>

      <SourceList cites={cites} locale={lang} />
    </div>
  );
}
