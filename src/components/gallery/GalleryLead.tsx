import Link from "next/link";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { T } from "@/components/text/T";
import { href, type Locale } from "@/i18n/config";
import { ratioOf } from "@/lib/artworks/map";
import type { Artwork, Series } from "@/lib/artworks/types";
import { seriesPath } from "@/lib/paths";
import styles from "./gallery.module.css";

/** The representative work of a cycle, large, beside the cycle's name, when the gallery shows that cycle. */
export function GalleryLead({ artwork, series, locale, toSeries }: { artwork: Artwork; series: Series; locale: Locale; toSeries: string }) {
  return (
    <section className={styles.lead} aria-labelledby="lead-title">
      <div className={styles.leadWork} style={{ "--ratio": ratioOf(artwork) } as React.CSSProperties}>
        <ArtworkCard artwork={artwork} locale={locale} size="l" eager morph />
      </div>
      <div className={styles.leadText}>
        <h2 id="lead-title" className={styles.leadTitle}>
          <T value={series.title} locale={locale} />
        </h2>
        {series.summary && (
          <p className={styles.leadSummary}>
            <T value={series.summary} locale={locale} />
          </p>
        )}
        <p className={styles.leadMore}>
          <Link href={href(locale, seriesPath(series))}>{toSeries}</Link>
        </p>
      </div>
    </section>
  );
}
