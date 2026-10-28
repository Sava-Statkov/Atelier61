import type { Composition } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ratioOf } from "@/lib/artworks/map";
import type { Artwork } from "@/lib/artworks/types";
import { ArtworkCard } from "./ArtworkCard";
import styles from "./hang.module.css";

/**
 * Hangs a group of works according to the series' composition (see `Composition` in types.ts).
 * Works keep their own proportions — nothing is cropped to fit a grid.
 */
export function SeriesHang({
  artworks,
  composition,
  locale,
  label,
}: {
  artworks: Artwork[];
  composition: Composition;
  locale: Locale;
  /** Accessible name for the scrolling sequence. */
  label: string;
}) {
  if (!artworks.length) {
    return <p className={styles.empty}>{getDictionary(locale).artwork.photoPending}.</p>;
  }

  const size = composition === "salon" ? "s" : composition === "wall" ? "l" : "m";
  const labelMode = composition === "salon" ? "compact" : "full";

  const items = artworks.map((a) => (
    <li key={a.slug} style={{ "--ratio": ratioOf(a) } as React.CSSProperties}>
      <ArtworkCard artwork={a} locale={locale} size={size} label={labelMode} />
    </li>
  ));

  if (composition === "sequence") {
    return (
      // A focusable region so the strip can be scrolled with the keyboard.
      <div className={styles.sequence} role="region" aria-label={label} tabIndex={0}>
        <ul>{items}</ul>
      </div>
    );
  }

  return (
    <ul className={styles[composition]} data-count={artworks.length}>
      {items}
    </ul>
  );
}
