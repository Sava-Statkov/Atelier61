import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesPage, seriesMetadata } from "@/components/series/SeriesPage";
import { isEnabledLocale } from "@/i18n/config";
import { getSeries, getSeriesList } from "@/lib/content";

/*
 * Practices (series with kind: "practice") at the top level, e.g. /risuvane-na-zhivo.
 * Named routes such as /tvorbi or /letopis take precedence; any other address is a 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getSeriesList()
    .filter((s) => s.kind === "practice")
    .map((s) => ({ practice: s.slug }));
}

function getPractice(slug: string) {
  const s = getSeries(slug);
  return s?.kind === "practice" ? s : undefined;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[practice]">): Promise<Metadata> {
  const { lang, practice } = await params;
  const s = isEnabledLocale(lang) ? getPractice(practice) : undefined;
  return s && isEnabledLocale(lang) ? seriesMetadata(s, lang) : {};
}

export default async function PracticePage({ params }: PageProps<"/[lang]/[practice]">) {
  const { lang, practice } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const s = getPractice(practice);
  if (!s) notFound();
  return <SeriesPage series={s} locale={lang} />;
}
