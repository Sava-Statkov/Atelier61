import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImage } from "@/components/art/ArtworkImage";
import { Portrait } from "@/components/art/Portrait";
import { WallLabel } from "@/components/art/WallLabel";
import { EditorNote } from "@/components/editor/Badge";
import { FilmPlayer } from "@/components/film/FilmPlayer";
import { LightRays } from "@/components/room/LightRays";
import { LightSlot } from "@/components/room/LightSlot";
import { Stone } from "@/components/room/Stone";
import { SeriesRoom } from "@/components/series/SeriesRoom";
import { Cite } from "@/components/text/Cite";
import { SourceList } from "@/components/text/SourceList";
import { T } from "@/components/text/T";
import { biography, site } from "@/content/site";
import { href, isEnabledLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ratioOf } from "@/lib/artworks/map";
import { getHomeArtwork, getSeriesList } from "@/lib/artworks/queries";
import { makeCitations, sourceIds } from "@/lib/citations";
import { getChronicle, getFilm, getQuote, getStories } from "@/lib/content";
import { yearOf } from "@/lib/dates";
import { filmForPlayer } from "@/lib/film";
import { visible } from "@/lib/publish";
import styles from "./home.module.css";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang);

  const [featured, seriesList] = await Promise.all([getHomeArtwork(), getSeriesList()]);
  const film = getFilm("intervyu");
  const cycles = seriesList.filter((s) => s.kind !== "practice");
  const practices = seriesList.filter((s) => s.kind === "practice");
  const stories = getStories();
  const bio = visible(biography);
  const years = [...new Set(getChronicle().map((e) => yearOf(e.date)).filter((y): y is number => y !== undefined))];

  const cites = makeCitations(
    lang,
    sourceIds(...seriesList, ...bio),
    seriesList.flatMap((s) => [...(s.facts ?? []).flatMap((f) => f.verification.sources ?? []), ...(s.quotes ?? []).map((q) => getQuote(q)?.source)]),
  );
  const name = pick(site.name, lang);
  const [first, ...rest] = name.value.split(" ");

  return (
    <>
      {/* The hall: the name is lettered on the wall, the work hangs beside it, the stone below. */}
      <section className={styles.hall} aria-labelledby="name">
        <div className={styles.wall}>
          <div className={styles.nameCell}>
            <h1 id="name" className={styles.name} lang={name.lang}>
              <span>{first}</span> <span>{rest.join(" ")}</span>
            </h1>
          </div>
          {/* The work chosen in the admin for the home page wall */}
          {featured && (
            <figure className={styles.featured} style={{ "--ratio": ratioOf(featured) } as React.CSSProperties}>
              <Link href={href(lang, `/tvorbi/${featured.slug}`)} className={styles.featuredLink}>
                <ArtworkImage artwork={featured} locale={lang} sizes="(min-width: 60rem) 40vw, 86vw" eager quality={90} />
              </Link>
              <figcaption>
                <WallLabel artwork={featured} locale={lang} />
              </figcaption>
            </figure>
          )}
          <p className={styles.line}>
            <T value={site.line} locale={lang} />
          </p>
        </div>
        <Stone />
      </section>

      {/* The interview, on a darkened stage. Its own page is reached from the menu and the footer. */}
      {film && (
        <section className={styles.film} data-room="stage" aria-labelledby="film-heading">
          <LightRays at={[38, 64]} />
          <div className={styles.filmText}>
            <h2 id="film-heading" className={styles.filmTitle}>
              <T value={film.title} locale={lang} />
            </h2>
            {film.workingTitle && <p className={styles.workingTitle}>{t.film.workingTitle}</p>}
            {film.synopsis && (
              <p>
                <T value={film.synopsis} locale={lang} />
              </p>
            )}
          </div>
          <div className={styles.filmScreen}>
            <FilmPlayer {...await filmForPlayer(film, lang)} />
          </div>
        </section>
      )}

      <section aria-labelledby="series-heading" className={styles.series}>
        <h2 id="series-heading" className={`page ${styles.sectionTitle} ${styles.seriesTitle}`}>
          {t.home.series}
        </h2>
        {cycles.map((s, i) => (
          <div key={s.slug}>
            {i > 0 && s.room !== "stage" && cycles[i - 1].room !== "stage" && <LightSlot />}
            <SeriesRoom series={s} locale={lang} cites={cites} />
          </div>
        ))}
        <p className={`page ${styles.allWorks}`}>
          <Link href={href(lang, "/tvorbi")}>{t.home.allWorks}</Link>
        </p>
      </section>

      {/* Ways of working that are not cycles (painting live with musicians) stand on their own */}
      {practices.map((s) => (
        <SeriesRoom key={s.slug} series={s} locale={lang} cites={cites} headingLevel={2} />
      ))}

      <LightSlot />

      {/* Years as an index into the chronicle */}
      <section className={`page ${styles.years}`} aria-labelledby="years-heading">
        <h2 id="years-heading" className={styles.sectionTitle}>
          {t.home.chronicle}
        </h2>
        <ol className={styles.yearList}>
          {years.map((y) => (
            <li key={y}>
              <Link href={`${href(lang, "/letopis")}#g-${y}`}>{y}</Link>
            </li>
          ))}
        </ol>
        <p className={styles.more}>
          <Link href={href(lang, "/letopis")}>{t.home.fullChronicle}</Link>
        </p>
      </section>

      {stories.length > 0 && (
        <>
          <LightSlot />
          <section className={`page ${styles.stories}`} aria-labelledby="stories-heading">
            <h2 id="stories-heading" className={styles.sectionTitle}>
              {t.home.stories}
            </h2>
            <ul className={styles.storyList}>
              {stories.map((s) => {
                const q = s.opening.kind === "quote" ? getQuote(s.opening.quote) : undefined;
                return (
                  <li key={s.slug}>
                    <p className={styles.storyOpening}>
                      {s.opening.kind === "question" && <T value={s.opening.text} locale={lang} />}
                      {q && (
                        <>
                          „<T value={q.text} locale={lang} />“
                        </>
                      )}
                    </p>
                    <h3 className={styles.storyTitle}>
                      <Link href={href(lang, `/istorii/${s.slug}`)}>
                        <T value={s.title} locale={lang} />
                      </Link>
                    </h3>
                    {s.lead && (
                      <p className={styles.storyLead}>
                        <T value={s.lead} locale={lang} />
                      </p>
                    )}
                    <EditorNote locale={lang}>{s.editorial !== "published" ? t.editor.editorial[s.editorial] : null}</EditorNote>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      <LightSlot />

      <section className={`page ${styles.about}`} aria-labelledby="about-heading">
        <h2 id="about-heading" className={styles.sectionTitle}>
          {t.home.about}
        </h2>
        <Portrait image={site.portrait} locale={lang} pendingLabel={t.home.portraitPending} className={styles.aboutPortrait} />
        <div className={styles.bio}>
          {bio.map((f, i) => (
            <p key={i}>
              <T value={f.text} locale={lang} />
              <Cite ids={f.verification.sources} cites={cites} />
            </p>
          ))}
        </div>
        <SourceList cites={cites} locale={lang} />
      </section>
    </>
  );
}
