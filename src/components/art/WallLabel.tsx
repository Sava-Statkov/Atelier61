import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Artwork } from "@/lib/artworks/types";
import { T } from "../text/T";
import styles from "./art.module.css";

/**
 * The museum label beside a work: title, year, technique, size, one per line, no separators.
 * Whatever is not known yet is left out; nothing is filled in.
 */
export function WallLabel({
  artwork,
  locale,
  as: Title = "p",
  compact = false,
}: {
  artwork: Artwork;
  locale: Locale;
  /** A heading level when the label names the page; an untitled work then gets a hidden heading. */
  as?: "p" | "h1" | "h2" | "h3";
  compact?: boolean;
}) {
  const d = artwork.dimensions;
  const facts = [
    artwork.year && <p key="year">{artwork.year}</p>,
    !compact && artwork.technique && (
      <p key="technique">
        <T value={artwork.technique} locale={locale} />
      </p>
    ),
    !compact && d && (
      <p key="size">
        {d.heightCm} × {d.widthCm}
        {d.depthCm ? ` × ${d.depthCm}` : ""} {locale === "bg" ? "см" : "cm"}
      </p>
    ),
  ].filter(Boolean);

  if (!artwork.title && !facts.length && Title === "p") return null;

  return (
    <div className={styles.label} data-compact={compact || undefined}>
      {artwork.title ? (
        <Title className={styles.labelTitle}>
          <T value={artwork.title} locale={locale} />
        </Title>
      ) : (
        Title !== "p" && <Title className="visually-hidden">{getDictionary(locale).artwork.untitled}</Title>
      )}
      {facts}
    </div>
  );
}
