import Image from "next/image";
import type { Block } from "@/content/types";
import { text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Citations } from "@/lib/citations";
import { getArtwork } from "@/lib/artworks/queries";
import { getQuote } from "@/lib/content";
import { isImagePublishable } from "@/lib/publish";
import { ArtworkCard } from "../art/ArtworkCard";
import { Cite } from "./Cite";
import { Facts } from "./Facts";
import { Quote } from "./Quote";
import { T } from "./T";
import styles from "./text.module.css";

/** Renders editorial blocks: paragraphs (with voice), quotes, artworks, images and fact lists. */
export async function Blocks({ blocks, locale, cites }: { blocks?: Block[]; locale: Locale; cites: Citations }) {
  if (!blocks?.length) return null;
  const t = getDictionary(locale);
  const works = await Promise.all(blocks.map((b) => (b.type === "artwork" ? getArtwork(b.slug) : null)));
  return (
    <div className={styles.blocks}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} data-voice={b.voice ?? "fact"}>
                {b.voice && b.voice !== "fact" && <span className={styles.voice}>{t.voice[b.voice]}. </span>}
                <T value={b.text} locale={locale} />
                <Cite ids={b.sources} cites={cites} />
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className={styles.blockHeading}>
                <T value={b.text} locale={locale} />
              </h2>
            );
          case "quote": {
            const q = getQuote(b.quote);
            return q ? <Quote key={i} quote={q} locale={locale} cites={cites} size="l" /> : null;
          }
          case "artwork": {
            const a = works[i];
            return a ? <ArtworkCard key={i} artwork={a} locale={locale} size="l" caption={b.caption} /> : null;
          }
          case "image": {
            const img = b.image;
            if (!isImagePublishable(img)) return null;
            return (
              <figure key={i} className={styles.photo}>
                <Image src={img.src} alt={text(img.alt, locale)} sizes="(min-width: 60rem) 60vw, 100vw" placeholder="blur" />
                {(b.caption || img.credit) && (
                  <figcaption>
                    {b.caption && <T value={b.caption} locale={locale} />}
                    {img.credit && <span className={styles.credit}>{img.credit}</span>}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "facts":
            return <Facts key={i} facts={b.items} locale={locale} cites={cites} />;
        }
      })}
    </div>
  );
}
