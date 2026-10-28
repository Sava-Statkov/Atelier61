import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { ArtworkImage } from "@/components/art/ArtworkImage";
import { Inspector } from "@/components/art/Inspector";
import { WallLabel } from "@/components/art/WallLabel";
import { EditorNote } from "@/components/editor/Badge";
import { Blocks } from "@/components/text/Blocks";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import { site } from "@/content/site";
import { href, isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { mainImage, ratioOf } from "@/lib/artwork";
import { makeCitations, sourceIds } from "@/lib/citations";
import { getArtwork, getArtworks, getExhibition, getRelatedArtworks, getSeries, getStoriesFor } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { isVisible } from "@/lib/publish";
import { seriesPath } from "@/lib/paths";
import styles from "./artwork.module.css";

export const dynamicParams = false;

// Called once per locale from the [lang] layout's params.
export function generateStaticParams() {
  return getArtworks().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tvorbi/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = isEnabledLocale(lang) ? getArtwork(slug) : undefined;
  if (!a || !isEnabledLocale(lang)) return {};
  const image = mainImage(a);
  const technique = a.technique ? text(a.technique, lang) : undefined;
  return {
    title: text(a.title, lang),
    description: [text(a.title, lang), technique, text(site.name, lang)].filter(Boolean).join(", "),
    openGraph: image ? { images: [{ url: image.src, width: image.width, height: image.height, alt: text(image.alt, lang) }] } : undefined,
  };
}

export default async function ArtworkPage({ params }: PageProps<"/[lang]/tvorbi/[slug]">) {
  const { lang, slug } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const a = getArtwork(slug);
  if (!a) notFound();
  const t = getDictionary(lang);

  const image = mainImage(a);
  const series = (a.series ?? []).map(getSeries).filter((s) => s !== undefined);
  const exhibitions = (a.exhibitions ?? []).map(getExhibition).filter((e) => e !== undefined);
  const stories = getStoriesFor({ artwork: a.slug });
  const related = getRelatedArtworks(a);
  const details = (a.details ?? []).filter((d) => isVisible(d.verification));
  const cites = makeCitations(lang, sourceIds(a, ...exhibitions), a.description?.flatMap((b) => (b.type === "p" ? b.sources ?? [] : [])));
  const email = site.contact.email;

  return (
    <article className={styles.artwork}>
      <div className={styles.view} style={{ "--ratio": ratioOf(a) } as React.CSSProperties}>
        <div className={styles.image}>
          <ArtworkImage artwork={a} locale={lang} sizes="(min-width: 60rem) 66vw, 100vw" eager morph quality={90} />
        </div>
        <aside className={styles.side}>
          <WallLabel artwork={a} locale={lang} as="h1" />
          {image && (
            <div className={styles.inspect}>
              <Inspector
                image={{ src: image.src, width: image.width, height: image.height, alt: text(image.alt, lang), blur: image.blur }}
                details={details.map((d) => ({ id: d.id, caption: text(d.caption, lang), region: d.region }))}
                labels={{
                  open: t.artwork.inspect,
                  close: t.artwork.close,
                  zoomIn: t.artwork.zoomIn,
                  zoomOut: t.artwork.zoomOut,
                  reset: t.artwork.reset,
                  help: t.artwork.inspectHelp,
                  details: t.artwork.details,
                }}
              />
            </div>
          )}
          {series.length > 0 && (
            <p className={styles.meta}>
              {t.artwork.series}{" "}
              {series.map((s, i) => (
                <span key={s.slug}>
                  {i > 0 && ", "}
                  <Link href={href(lang, seriesPath(s))}>
                    <T value={s.title} locale={lang} />
                  </Link>
                </span>
              ))}
            </p>
          )}
          {exhibitions.length > 0 && (
            <div className={styles.meta}>
              <p>{t.artwork.exhibitions}</p>
              <ul>
                {exhibitions.map((e) => (
                  <li key={e.id}>
                    „<T value={e.title} locale={lang} />“, <T value={e.venue} locale={lang} />
                    {e.city && (
                      <>
                        , <T value={e.city} locale={lang} />
                      </>
                    )}
                    , {formatDate(e.dates, lang)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.enquiries && email && (
            <p className={styles.enquiry}>
              <a href={`mailto:${email}?subject=${encodeURIComponent(`${t.artwork.enquirySubject} „${text(a.title, lang)}“`)}`}>
                {t.artwork.enquire}
              </a>
            </p>
          )}
          <EditorNote locale={lang}>{a.verification.note}</EditorNote>
        </aside>
      </div>

      <div className="page">
        <Blocks blocks={a.description} locale={lang} cites={cites} />

        {stories.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.artwork.stories}</h2>
            <ul className={styles.storyLinks}>
              {stories.map((s) => (
                <li key={s.slug}>
                  <Link href={href(lang, `/istorii/${s.slug}`)}>
                    <T value={s.title} locale={lang} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.artwork.related}</h2>
            <ul className={styles.related}>
              {related.map((r) => (
                <li key={r.slug} style={{ "--ratio": ratioOf(r) } as React.CSSProperties}>
                  <ArtworkCard artwork={r} locale={lang} size="s" label="compact" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <SourceList cites={cites} locale={lang} />
      </div>
    </article>
  );
}
