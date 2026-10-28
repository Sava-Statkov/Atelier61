import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import { ArtworkImage, photoAlt } from "@/components/art/ArtworkImage";
import { Inspector } from "@/components/art/Inspector";
import { WallLabel } from "@/components/art/WallLabel";
import { Blocks } from "@/components/text/Blocks";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import type { Block } from "@/content/types";
import { site } from "@/content/site";
import { href, isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { nameOf, ratioOf } from "@/lib/artworks/map";
import { getArtwork, getPublishedSlugs, getRelatedArtworks, getSeries } from "@/lib/artworks/queries";
import { makeCitations, sourceIds } from "@/lib/citations";
import { getExhibitionsOf, getStoriesFor } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import { seriesPath } from "@/lib/paths";
import styles from "./artwork.module.css";

// Works published after the build get their page on the first visit.
export const dynamicParams = true;

// Called once per locale from the [lang] layout's params.
export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tvorbi/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = isEnabledLocale(lang) ? await getArtwork(slug) : null;
  if (!a || !isEnabledLocale(lang)) return {};
  const photo = a.photos[0];
  const title = text(nameOf(a), lang);
  return {
    title,
    description: [title, a.technique && text(a.technique, lang), a.year, text(site.name, lang)].filter(Boolean).join(", "),
    openGraph: photo ? { images: [{ url: photo.url, width: photo.width, height: photo.height, alt: photoAlt(a, lang) }] } : undefined,
  };
}

/** The description is plain text in the database; blank lines separate paragraphs. */
function paragraphs(description: string): Block[] {
  return description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: "p", text: { bg: p } }));
}

export default async function ArtworkPage({ params }: PageProps<"/[lang]/tvorbi/[slug]">) {
  const { lang, slug } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const a = await getArtwork(slug);
  if (!a) notFound();
  const t = getDictionary(lang);

  const [main, ...morePhotos] = a.photos;
  const [series, related] = await Promise.all([a.cycle ? getSeries(a.cycle.slug) : undefined, getRelatedArtworks(a)]);
  const exhibitions = getExhibitionsOf(a.slug);
  const stories = getStoriesFor({ artwork: a.slug });
  const cites = makeCitations(lang, a.sources, sourceIds(...exhibitions));
  const email = site.contact.email;

  return (
    <article className={styles.artwork}>
      <div className={styles.view} style={{ "--ratio": ratioOf(a) } as React.CSSProperties}>
        <div className={styles.image}>
          <ArtworkImage artwork={a} locale={lang} sizes="(min-width: 60rem) 66vw, 100vw" eager morph quality={90} />
        </div>
        <aside className={styles.side}>
          <WallLabel artwork={a} locale={lang} as="h1" />
          {main && (
            <div className={styles.inspect}>
              <Inspector
                image={{ src: main.url, width: main.width, height: main.height, alt: photoAlt(a, lang), blur: main.blur }}
                labels={{
                  open: t.artwork.inspect,
                  close: t.artwork.close,
                  zoomIn: t.artwork.zoomIn,
                  zoomOut: t.artwork.zoomOut,
                  reset: t.artwork.reset,
                  help: t.artwork.inspectHelp,
                }}
              />
            </div>
          )}
          {main?.credit && <p className={styles.meta}>{main.credit}</p>}
          {series && (
            <p className={styles.meta}>
              {t.artwork.series}{" "}
              <Link href={href(lang, seriesPath(series))}>
                <T value={series.title} locale={lang} />
              </Link>
            </p>
          )}
          {a.category && (
            <p className={styles.meta}>
              {t.explorer.byCategory}:{" "}
              <Link href={`${href(lang, "/tvorbi")}?kategoriya=${a.category.slug}`}>
                <T value={a.category.name} locale={lang} />
              </Link>
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
          {email && (
            <p className={styles.enquiry}>
              <a href={`mailto:${email}?subject=${encodeURIComponent(`${t.artwork.enquirySubject} „${text(nameOf(a), lang)}“`)}`}>
                {t.artwork.enquire}
              </a>
            </p>
          )}
        </aside>
      </div>

      <div className="page">
        {morePhotos.length > 0 && (
          <ul className={styles.photos}>
            {morePhotos.map((p) => (
              <li key={p.url} style={{ "--ratio": p.width / p.height } as React.CSSProperties}>
                <figure>
                  <Image
                    src={p.url}
                    width={p.width}
                    height={p.height}
                    alt={p.alt ?? photoAlt(a, lang)}
                    sizes="(min-width: 60rem) 30vw, 90vw"
                    placeholder={p.blur ? "blur" : "empty"}
                    blurDataURL={p.blur ?? undefined}
                  />
                  {p.credit && <figcaption>{p.credit}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        )}

        {a.description && <Blocks blocks={paragraphs(a.description.bg)} locale={lang} cites={cites} />}

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
