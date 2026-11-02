import type { MetadataRoute } from "next";
import { enabledLocales, href } from "@/i18n/config";
import { getPublishedSlugs, getSeriesList } from "@/lib/artworks/queries";
import { getStories } from "@/lib/content";
import { seriesPath } from "@/lib/paths";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3300";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, seriesList] = await Promise.all([getPublishedSlugs(), getSeriesList()]);
  const paths = [
    "/",
    "/tvorbi",
    "/letopis",
    "/izlozhbi",
    "/intervyu",
    "/kontakt",
    ...slugs.map((slug) => `/tvorbi/${slug}`),
    ...seriesList.map(seriesPath),
    ...getStories().map((s) => `/istorii/${s.slug}`),
  ];
  return enabledLocales.flatMap((locale) => paths.map((p) => ({ url: new URL(href(locale, p), base).toString() })));
}
