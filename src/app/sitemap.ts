import type { MetadataRoute } from "next";
import { enabledLocales, href } from "@/i18n/config";
import { getArtworks, getSeriesList, getStories } from "@/lib/content";
import { seriesPath } from "@/lib/paths";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3300";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/tvorbi",
    "/letopis",
    "/intervyu",
    "/kontakt",
    ...getArtworks().map((a) => `/tvorbi/${a.slug}`),
    ...getSeriesList().map(seriesPath),
    ...getStories().map((s) => `/istorii/${s.slug}`),
  ];
  return enabledLocales.flatMap((locale) => paths.map((p) => ({ url: new URL(href(locale, p), base).toString() })));
}
