import type { Artwork } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/lib/dates";
import { showEditorNotes } from "@/lib/publish";
import { Badge } from "../editor/Badge";
import { T } from "../text/T";
import styles from "./art.module.css";

/**
 * The museum label beside a work. One fact per line, no separators.
 * Fields listed in `pending` are hidden on the public site.
 */
export function WallLabel({
  artwork,
  locale,
  as: Title = "p",
  compact = false,
}: {
  artwork: Artwork;
  locale: Locale;
  as?: "p" | "h1" | "h2" | "h3";
  compact?: boolean;
}) {
  const t = getDictionary(locale);
  const pending = new Set(artwork.pending ?? []);
  const show = (field: "date" | "technique" | "dimensions" | "collection") => showEditorNotes || !pending.has(field);
  const d = artwork.dimensions;

  return (
    <div className={styles.label} data-compact={compact || undefined}>
      <Title className={styles.labelTitle}>
        <T value={artwork.title} locale={locale} />
        <Badge verification={artwork.verification} locale={locale} />
      </Title>
      {artwork.date && show("date") && <p>{formatDate(artwork.date, locale)}</p>}
      {!compact && artwork.technique && show("technique") && (
        <p>
          <T value={artwork.technique} locale={locale} />
        </p>
      )}
      {!compact && d && show("dimensions") && (
        <p>
          {d.heightCm} × {d.widthCm}
          {d.depthCm ? ` × ${d.depthCm}` : ""} {locale === "bg" ? "см" : "cm"}
        </p>
      )}
      {!compact && artwork.collection && show("collection") && (
        <p>
          <T value={artwork.collection} locale={locale} />
        </p>
      )}
      {!compact && showEditorNotes && pending.size > 0 && (
        <p className={styles.pending}>
          {t.verification.pendingFields}: {[...pending].map((f) => t.label[f]).join(", ")}
        </p>
      )}
    </div>
  );
}
