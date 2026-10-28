import Link from "next/link";
import type { Artwork, Localized } from "@/content/types";
import { href, type Locale } from "@/i18n/config";
import { T } from "../text/T";
import { ArtworkImage } from "./ArtworkImage";
import { DetailedLabel } from "./DetailedLabel";
import { WallLabel } from "./WallLabel";
import styles from "./art.module.css";

const sizesFor = {
  s: "(min-width: 60rem) 18vw, 45vw",
  m: "(min-width: 60rem) 30vw, 90vw",
  l: "(min-width: 60rem) 60vw, 100vw",
  /** The works page: at most half the wall on desktop, two thirds on tablet. */
  wall: "(min-width: 60rem) 50vw, (min-width: 40rem) 66vw, 100vw",
};

/** A work as it hangs in a list: the image, then its label. Links to the work's own page. */
export function ArtworkCard({
  artwork,
  locale,
  size = "m",
  caption,
  morph,
  label = "full",
}: {
  artwork: Artwork;
  locale: Locale;
  size?: keyof typeof sizesFor;
  caption?: Localized;
  morph?: boolean;
  /** `detailed`: the long label of the works page, with series and short description. */
  label?: "full" | "compact" | "detailed" | "none";
}) {
  return (
    <figure className={styles.card} data-size={size}>
      <Link href={href(locale, `/tvorbi/${artwork.slug}`)} className={styles.cardLink}>
        <ArtworkImage artwork={artwork} locale={locale} sizes={sizesFor[size]} morph={morph} />
        {label === "none" && (
          <span className="visually-hidden">
            <T value={artwork.title} locale={locale} />
          </span>
        )}
      </Link>
      {(label !== "none" || caption) && (
        <figcaption>
          {label === "detailed" && <DetailedLabel artwork={artwork} locale={locale} />}
          {(label === "full" || label === "compact") && (
            <WallLabel artwork={artwork} locale={locale} compact={label === "compact"} />
          )}
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
