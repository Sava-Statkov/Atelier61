import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Citations } from "@/lib/citations";
import { formatDate } from "@/lib/dates";
import styles from "./text.module.css";

export function SourceList({ cites, locale, note }: { cites: Citations; locale: Locale; note?: string }) {
  if (!cites.list.length) return null;
  const t = getDictionary(locale);
  return (
    <section className={styles.sources} aria-labelledby="sources-heading">
      <h2 id="sources-heading" className={styles.sourcesHeading}>
        {t.sources.heading}
      </h2>
      {note && <p className={styles.sourcesNote}>{note}</p>}
      <ol>
        {cites.list.map((s) => (
          <li key={s.id} id={`source-${s.id}`} lang={s.language}>
            {s.url ? (
              <a href={s.url} rel="noopener" target="_blank">
                {s.title}
              </a>
            ) : (
              s.title
            )}
            <span className={styles.sourceMeta}>
              {[s.outlet, s.author, s.date && formatDate(s.date, locale)].filter(Boolean).join(", ")}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
