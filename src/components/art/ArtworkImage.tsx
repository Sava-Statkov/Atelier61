import Image from "next/image";
import { ViewTransition } from "react";
import type { Artwork } from "@/content/types";
import { text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { mainImage, ratioOf } from "@/lib/artwork";
import { RawCanvas } from "./RawCanvas";
import styles from "./art.module.css";

type Props = {
  artwork: Artwork;
  locale: Locale;
  /** `sizes` attribute for responsive images. */
  sizes: string;
  /** The main image of the screen: load at once with high priority (Next 16 replaces `priority`). */
  eager?: boolean;
  /** Hung on a wall (shadow underneath) or flat. */
  hung?: boolean;
  /** Morph between list and detail page. Only one element per page may carry it. */
  morph?: boolean;
  quality?: 75 | 90;
};

export function ArtworkImage({ artwork, locale, sizes, eager, hung = true, morph = false, quality = 75 }: Props) {
  const image = mainImage(artwork);
  const ratio = ratioOf(artwork);
  const content = image ? (
    <Image
      src={image.src}
      width={image.width}
      height={image.height}
      alt={text(image.alt, locale)}
      sizes={sizes}
      quality={quality}
      loading={eager ? "eager" : undefined}
      fetchPriority={eager ? "high" : undefined}
      placeholder="blur"
      blurDataURL={image.blur}
      style={{ backgroundColor: image.color }}
      className={styles.image}
    />
  ) : (
    <RawCanvas ratio={ratio} label={getDictionary(locale).artwork.photoPending} />
  );

  const framed = (
    <div className={styles.frame} data-hung={hung || undefined} style={{ aspectRatio: String(ratio) }}>
      {content}
    </div>
  );

  return morph ? (
    <ViewTransition name={`artwork-${artwork.slug}`} share="artwork-morph" default="none">
      {framed}
    </ViewTransition>
  ) : (
    framed
  );
}
