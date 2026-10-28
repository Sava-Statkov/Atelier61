import type { Localized } from "@/content/types";
import { pick, type Locale } from "@/i18n/config";

/** Localized text. When the Bulgarian original stands in for a missing translation it is marked lang="bg". */
export function T({ value, locale }: { value: Localized; locale: Locale }) {
  const { value: content, lang } = pick(value, locale);
  return lang ? <span lang={lang}>{content}</span> : <>{content}</>;
}
