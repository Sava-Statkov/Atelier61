import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { WorksExplorer, type ExplorerItem } from "@/components/art/WorksExplorer";
import type { Medium } from "@/content/types";
import { isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ratioOf } from "@/lib/artwork";
import { getArtworks, getSeriesList } from "@/lib/content";
import { sortKey } from "@/lib/dates";
import { hangStyle } from "@/lib/hang";
import explorer from "@/components/art/explorer.module.css";
import styles from "../pages.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/tvorbi">): Promise<Metadata> {
  const { lang } = await params;
  return isEnabledLocale(lang) ? { title: getDictionary(lang).nav.works } : {};
}

export default async function WorksPage({ params }: PageProps<"/[lang]/tvorbi">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang);

  // Dated works first, oldest to newest; undated works keep their order from artworks.ts.
  const works = getArtworks()
    .map((a, i) => ({ a, i }))
    .sort((x, y) => sortKey(x.a.date) - sortKey(y.a.date) || x.i - y.i)
    .map(({ a }) => a);

  const items: ExplorerItem[] = works.map((a) => ({
    slug: a.slug,
    series: a.series ?? [],
    media: a.media ?? [],
    ratio: ratioOf(a),
    node: <ArtworkCard artwork={a} locale={lang} size="wall" label="detailed" morph />,
  }));

  const usedSeries = new Set(works.flatMap((a) => a.series ?? []));
  const usedMedia = new Set(works.flatMap((a) => a.media ?? []));
  const seriesOptions = getSeriesList()
    .filter((s) => usedSeries.has(s.slug))
    .map((s) => ({ value: s.slug, label: text(s.title, lang) }));
  const mediaOptions = (Object.keys(t.media) as Medium[]).filter((m) => usedMedia.has(m)).map((m) => ({ value: m, label: t.media[m] }));

  const labels = {
    all: t.explorer.all,
    bySeries: t.explorer.bySeries,
    byMedium: t.explorer.byMedium,
    empty: t.explorer.empty,
    reset: t.explorer.reset,
    count: t.explorer.count,
  };

  return (
    <div className="page">
      <header className={styles.intro}>
        <h1 className={styles.pageTitle}>{t.nav.works}</h1>
      </header>
      {/* useSearchParams needs a Suspense boundary; the fallback is the same hang, unfiltered.
          It leaves out the morph names, so revealing the filtered list does not pair them up and
          start a page-wide view transition. */}
      <Suspense
        fallback={
          <ul className={explorer.wall}>
            {works.map((a, index) => (
              <li key={a.slug} style={hangStyle(index, ratioOf(a))}>
                <ArtworkCard artwork={a} locale={lang} size="wall" label="detailed" />
              </li>
            ))}
          </ul>
        }
      >
        <WorksExplorer items={items} series={seriesOptions} media={mediaOptions} labels={labels} />
      </Suspense>
    </div>
  );
}
