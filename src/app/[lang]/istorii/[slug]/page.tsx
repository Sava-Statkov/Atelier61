import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorNote } from "@/components/editor/Badge";
import { Blocks } from "@/components/text/Blocks";
import { Quote } from "@/components/text/Quote";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import { href, isEnabledLocale, text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { makeCitations, sourceIds, type Citations } from "@/lib/citations";
import { nameOf } from "@/lib/artworks/map";
import { getArtwork, getSeries } from "@/lib/artworks/queries";
import { getQuote, getStories, getStory } from "@/lib/content";
import { seriesPath } from "@/lib/paths";
import type { Story } from "@/content/types";
import styles from "./story.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStories().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/istorii/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const s = isEnabledLocale(lang) ? getStory(slug) : undefined;
  if (!s || !isEnabledLocale(lang)) return {};
  return { title: text(s.title, lang), description: s.lead ? text(s.lead, lang) : undefined };
}

/** The story begins where the curiosity begins: a question or a quote. */
function Opening({ story, locale, cites }: { story: Story; locale: Locale; cites: Citations }) {
  const o = story.opening;
  if (o.kind === "question") {
    return (
      <p className={styles.question}>
        <T value={o.text} locale={locale} />
      </p>
    );
  }
  if (o.kind === "quote") {
    const q = getQuote(o.quote);
    return q ? <Quote quote={q} locale={locale} cites={cites} size="l" /> : null;
  }
  return null;
}

export default async function StoryPage({ params }: PageProps<"/[lang]/istorii/[slug]">) {
  const { lang, slug } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const story = getStory(slug);
  if (!story) notFound();
  const t = getDictionary(lang);

  const openingQuote = story.opening.kind === "quote" ? getQuote(story.opening.quote) : undefined;
  const bodyQuotes = story.body.flatMap((b) => (b.type === "quote" ? [getQuote(b.quote)?.source] : []));
  const cites = makeCitations(
    lang,
    [openingQuote?.source],
    story.body.flatMap((b) => (b.type === "p" ? b.sources ?? [] : [])),
    bodyQuotes,
    sourceIds(story),
  );
  const series = (await Promise.all((story.series ?? []).map(getSeries))).filter((s) => s !== undefined);
  const works = (await Promise.all((story.artworks ?? []).map(getArtwork))).filter((a) => a !== null);

  return (
    <article className={`page ${styles.story}`}>
      <header className={styles.header}>
        <Opening story={story} locale={lang} cites={cites} />
        <h1 className={styles.title}>
          <T value={story.title} locale={lang} />
        </h1>
        {story.lead && (
          <p className={styles.lead}>
            <T value={story.lead} locale={lang} />
          </p>
        )}
        <EditorNote locale={lang}>{story.editorial !== "published" ? t.editor.editorial[story.editorial] : null}</EditorNote>
      </header>

      <div className={styles.body}>
        <Blocks blocks={story.body} locale={lang} cites={cites} />
        {(series.length > 0 || works.length > 0) && (
          <aside className={styles.related}>
            <h2>{t.stories.related}</h2>
            <ul>
              {series.map((s) => (
                <li key={s.slug}>
                  <Link href={href(lang, seriesPath(s))}>
                    <T value={s.title} locale={lang} />
                  </Link>
                </li>
              ))}
              {works.map((a) => (
                <li key={a.slug}>
                  <Link href={href(lang, `/tvorbi/${a.slug}`)}>
                    <T value={nameOf(a)} locale={lang} />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <SourceList cites={cites} locale={lang} note={t.stories.sourcesNote} />
    </article>
  );
}
