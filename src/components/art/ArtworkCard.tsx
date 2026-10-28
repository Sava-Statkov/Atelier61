import Link from "next/link";
import type { Localized } from "@/content/types";
import { href, type Locale } from "@/i18n/config";
import type { Artwork } from "@/lib/artworks/types";
import { T } from "../text/T";
import { ArtworkImage, photoAlt } from "./ArtworkImage";
import { WallLabel } from "./WallLabel";
import styles from "./art.module.css";

const sizesFor = {
  s: "(min-width: 60rem) 18vw, 45vw",
  m: "(min-width: 60rem) 30vw, 90vw",
  l: "(min-width: 60rem) 60vw, 100vw",
  /** The works page: four columns on desktop, three on tablet, two on phones. */
  gallery: "(min-width: 60rem) 24vw, (min-width: 40rem) 32vw, 48vw",
};

/** A work as it hangs in a list: the image, then its label. Links to the work's own page. */
export function ArtworkCard({
  artwork,
  locale,
  size = "m",
  caption,
  morph,
  eager,
  label = "full",
}: {
  artwork: Artwork;
  locale: Locale;
  size?: keyof typeof sizesFor;
  caption?: Localized;
  morph?: boolean;
  eager?: boolean;
  label?: "full" | "compact" | "none";
}) {
  return (
    <figure className={styles.card} data-size={size}>
      <Link href={href(locale, `/tvorbi/${artwork.slug}`)} className={styles.cardLink}>
        <ArtworkImage artwork={artwork} locale={locale} sizes={sizesFor[size]} morph={morph} eager={eager} />
        {label === "none" && <span className="visually-hidden">{photoAlt(artwork, locale)}</span>}
      </Link>
      {(label !== "none" || caption) && (
        <figcaption>
          {label !== "none" && <WallLabel artwork={artwork} locale={locale} compact={label === "compact"} />}
          {caption && (
            <p className={styles.caption}>
              <T value={caption} locale={locale} />
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
