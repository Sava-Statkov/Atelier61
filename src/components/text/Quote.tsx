import type { Quote as QuoteType } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Citations } from "@/lib/citations";
import { Cite } from "./Cite";
import { T } from "./T";
import styles from "./text.module.css";

/** The artist's own words. Typeset apart from everything written about him. */
export function Quote({
  quote,
  locale,
  cites,
  size = "m",
}: {
  quote: QuoteType;
  locale: Locale;
  cites: Citations;
  size?: "m" | "l";
}) {
  const t = getDictionary(locale);
  const speaker = quote.speaker === "artist" ? undefined : quote.speaker;
  return (
    <figure className={styles.quote} data-size={size}>
      <blockquote>
        <p>
          „<T value={quote.text} locale={locale} />“
        </p>
      </blockquote>
      <figcaption>
        {speaker ?? t.voice.artist}
        {quote.context && (
          <>
            , <T value={quote.context} locale={locale} />
          </>
        )}
        <Cite ids={[quote.source]} cites={cites} />
      </figcaption>
    </figure>
  );
}
