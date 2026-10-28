import Image from "next/image";
import { ViewTransition } from "react";
import { text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ratioOf } from "@/lib/artworks/map";
import type { Artwork } from "@/lib/artworks/types";
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

/** What a photograph of the work shows; without a description, the title or a plain "a work by". */
export function photoAlt(artwork: Artwork, locale: Locale): string {
  const photo = artwork.photos[0];
  if (photo?.alt) return photo.alt;
  return artwork.title ? text(artwork.title, locale) : getDictionary(locale).artwork.untitled;
}

export function ArtworkImage({ artwork, locale, sizes, eager, hung = true, morph = false, quality = 75 }: Props) {
  const photo = artwork.photos[0];
  const ratio = ratioOf(artwork);
  const content = photo ? (
    <Image
      src={photo.url}
      width={photo.width}
      height={photo.height}
      alt={photoAlt(artwork, locale)}
      sizes={sizes}
      quality={quality}
      loading={eager ? "eager" : undefined}
      fetchPriority={eager ? "high" : undefined}
      placeholder={photo.blur ? "blur" : "empty"}
      blurDataURL={photo.blur ?? undefined}
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
