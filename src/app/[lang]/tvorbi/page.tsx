import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery/Gallery";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { GalleryLead } from "@/components/gallery/GalleryLead";
import { href, isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { countArtworks, getArtworkById, getCategories, getGalleryPage, getSeriesList, getUsedTerms } from "@/lib/artworks/queries";
import gallery from "@/components/gallery/gallery.module.css";
import styles from "../pages.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/tvorbi">): Promise<Metadata> {
  const { lang } = await params;
  return isEnabledLocale(lang) ? { title: getDictionary(lang).nav.works } : {};
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** All published works, or those of one category and/or cycle (?kategoriya=…&cikal=…). */
export default async function WorksPage({ params, searchParams }: PageProps<"/[lang]/tvorbi">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang);
  const search = await searchParams;

  const [categories, seriesList, used] = await Promise.all([getCategories(), getSeriesList(), getUsedTerms()]);
  const category = categories.find((c) => c.slug === first(search.kategoriya));
  const series = seriesList.find((s) => s.slug === first(search.cikal));

  // The cycle's representative work leads its view, if it is published and fits the filters.
  const featured = series?.featuredArtworkId ? await getArtworkById(series.featuredArtworkId) : null;
  const lead = featured && featured.cycle?.id === series?.id && (!category || featured.category?.id === category.id) ? featured : null;

  const filter = { categoryId: category?.id ?? null, cycleId: series?.id ?? null };
  const query = { ...filter, excludeId: lead?.id ?? null };
  const [page, total] = await Promise.all([getGalleryPage(query), countArtworks(filter)]);

  const active = { kategoriya: category?.slug ?? "", cikal: series?.slug ?? "" };
  const filterKey = `${active.kategoriya}|${active.cikal}`;

  return (
    <div className="page">
      <header className={styles.intro}>
        <h1 className={styles.pageTitle}>{t.nav.works}</h1>
      </header>

      <GalleryFilters
        key={`filters-${filterKey}`}
        active={active}
        allLabel={t.explorer.all}
        groups={[
          {
            key: "kategoriya",
            legend: t.explorer.byCategory,
            options: categories.filter((c) => used.categoryIds.includes(c.id)).map((c) => ({ value: c.slug, label: c.name })),
          },
          {
            key: "cikal",
            legend: t.explorer.bySeries,
            options: seriesList.filter((s) => used.cycleIds.includes(s.id)).map((s) => ({ value: s.slug, label: text(s.title, lang) })),
          },
        ]}
      />

      <p className={gallery.count} role="status">
        {(total === 1 ? t.explorer.count.one : t.explorer.count.many).replace("{n}", String(total))}
      </p>

      {lead && series && <GalleryLead artwork={lead} series={series} locale={lang} toSeries={t.explorer.toSeries} />}

      {total > 0 ? (
        <Gallery
          key={`gallery-${filterKey}`}
          locale={lang}
          initial={page}
          query={query}
          labels={{ more: t.explorer.more, loading: t.explorer.loading, failed: t.explorer.failed, list: t.nav.works }}
        />
      ) : (
        <p className={gallery.empty}>
          {t.explorer.empty}
          <Link href={href(lang, "/tvorbi")}>{t.explorer.reset}</Link>
        </p>
      )}
    </div>
  );
}
