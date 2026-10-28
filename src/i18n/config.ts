import type { Localized } from "@/content/types";

export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

/**
 * Locales that have routes. Bulgarian is served at the root (`/tvorbi`), other locales under a
 * prefix (`/en/tvorbi`). To launch English: add "en" here, finish `dictionaries/en.ts`, add `en`
 * texts to content — anything untranslated falls back to Bulgarian marked with lang="bg".
 */
export const enabledLocales: readonly Locale[] = ["bg"];

export function isEnabledLocale(value: string): value is Locale {
  return (enabledLocales as readonly string[]).includes(value);
}

/** Builds a link for a locale. Paths are written without a locale prefix: `href("bg", "/tvorbi")`. */
export function href(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Picks the text for a locale. `lang` is set when the Bulgarian original is used as fallback. */
export function pick<T>(value: Localized<T>, locale: Locale): { value: T; lang?: Locale } {
  if (locale !== "bg" && value[locale] !== undefined) return { value: value[locale] as T };
  return locale === "bg" ? { value: value.bg } : { value: value.bg, lang: "bg" };
}

/** Plain string for attributes and metadata, where a `lang` wrapper is impossible. */
export function text(value: Localized, locale: Locale): string {
  return pick(value, locale).value;
}
