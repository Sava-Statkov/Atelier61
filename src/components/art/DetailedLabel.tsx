import Link from "next/link";
import type { Artwork } from "@/content/types";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSeries } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { showEditorNotes } from "@/lib/publish";
import { seriesPath } from "@/lib/paths";
import { Badge } from "../editor/Badge";
import { T } from "../text/T";
import styles from "./art.module.css";

/**
 * The longer label used on the works page: title, then one fact per line, the series and a short
 * description. In the working version every missing field shows as a dashed slot, so the space
 * the text will take is visible; on the public site a missing field is simply left out.
 */
export function DetailedLabel({ artwork, locale }: { artwork: Artwork; locale: Locale }) {
  const t = getDictionary(locale);
  const pending = new Set(artwork.pending ?? []);
  const known = (field: "date" | "technique" | "dimensions") => !pending.has(field) || showEditorNotes;
  const d = artwork.dimensions;
  const series = (artwork.series ?? []).map(getSeries).filter((s) => s !== undefined);

  const slot = (label: string) =>
    showEditorNotes ? <p className={styles.slot}>{t.editor.slot.replace("{label}", label)}</p> : null;

  return (
    <div className={styles.detailed}>
      <p className={styles.detailedTitle}>
        <T value={artwork.title} locale={locale} />
        <Badge verification={artwork.verification} locale={locale} />
      </p>
      <div className={styles.detailedFacts}>
        {artwork.date && known("date") ? <p>{formatDate(artwork.date, locale)}</p> : slot(t.label.date)}
        {artwork.technique && known("technique") ? (
          <p>
            <T value={artwork.technique} locale={locale} />
          </p>
        ) : (
          slot(t.label.technique)
        )}
        {d && known("dimensions") ? (
          <p>
            {d.heightCm} × {d.widthCm}
            {d.depthCm ? ` × ${d.depthCm}` : ""} {locale === "bg" ? "см" : "cm"}
          </p>
        ) : (
          slot(t.label.dimensions)
        )}
      </div>
      {series.length > 0 && (
        <p className={styles.detailedSeries}>
          {series.length === 1 ? t.label.series : t.label.seriesMany}:{" "}
          {series.map((s, i) => (
            <span key={s.slug}>
              {i > 0 && ", "}
              <Link href={href(locale, seriesPath(s))}>
                <T value={s.title} locale={locale} />
              </Link>
            </span>
          ))}
        </p>
      )}
      {artwork.summary ? (
        <p className={styles.detailedSummary}>
          <T value={artwork.summary} locale={locale} />
        </p>
      ) : (
        showEditorNotes && <p className={`${styles.slot} ${styles.slotSummary}`}>{t.editor.slot.replace("{label}", t.label.summary)}</p>
      )}
    </div>
  );
}
