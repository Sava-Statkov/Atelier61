import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesPage, seriesMetadata } from "@/components/series/SeriesPage";
import { isEnabledLocale } from "@/i18n/config";
import { getSeries, getSeriesList } from "@/lib/artworks/queries";

// A cycle added in the admin after the build gets its page on the first visit.
export const dynamicParams = true;

// Cycles only; practices have an address of their own (app/[lang]/[practice]).
export async function generateStaticParams() {
  return (await getSeriesList()).filter((s) => s.kind !== "practice").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/cikli/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const s = isEnabledLocale(lang) ? await getSeries(slug) : undefined;
  return s && isEnabledLocale(lang) && s.kind !== "practice" ? seriesMetadata(s, lang) : {};
}

export default async function CyclePage({ params }: PageProps<"/[lang]/cikli/[slug]">) {
  const { lang, slug } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const s = await getSeries(slug);
  if (!s || s.kind === "practice") notFound();
  return <SeriesPage series={s} locale={lang} />;
}
