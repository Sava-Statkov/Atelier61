import Image from "next/image";
import type { ImageAsset } from "@/content/types";
import { text, type Locale } from "@/i18n/config";
import { resolveImage } from "@/lib/artwork";
import { isImagePublishable } from "@/lib/publish";
import styles from "./art.module.css";

/**
 * A photograph of a person (the artist, the studio), small and in portrait format.
 * Without a usable photograph it shows an empty frame that says what is missing.
 */
export function Portrait({
  image,
  locale,
  pendingLabel,
  className,
}: {
  image: ImageAsset | null;
  locale: Locale;
  pendingLabel: string;
  className?: string;
}) {
  const photo = image && isImagePublishable(image) ? resolveImage(image) : undefined;
  return (
    <figure className={`${styles.portrait} ${className ?? ""}`}>
      {photo ? (
        <>
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={text(photo.alt, locale)}
            sizes="20rem"
            placeholder="blur"
            blurDataURL={photo.blur}
          />
          {photo.credit && <figcaption>{photo.credit}</figcaption>}
        </>
      ) : (
        <div className={styles.portraitPending}>
          <span>{pendingLabel}</span>
        </div>
      )}
    </figure>
  );
}
