import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorNote } from "@/components/editor/Badge";
import { FilmPlayer } from "@/components/film/FilmPlayer";
import { LightRays } from "@/components/room/LightRays";
import { T } from "@/components/text/T";
import { isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getFilm } from "@/lib/content";
import { filmForPlayer } from "@/lib/film";
import styles from "./film.module.css";

const FILM = "intervyu";

export async function generateMetadata({ params }: PageProps<"/[lang]/intervyu">): Promise<Metadata> {
  const { lang } = await params;
  const film = isEnabledLocale(lang) ? getFilm(FILM) : undefined;
  if (!film || !isEnabledLocale(lang)) return {};
  return { title: getDictionary(lang).nav.film, description: film.synopsis ? text(film.synopsis, lang) : undefined };
}

export default async function FilmPage({ params }: PageProps<"/[lang]/intervyu">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const film = getFilm(FILM);
  if (!film) notFound();
  const t = getDictionary(lang);

  return (
    <article data-room="stage" className={styles.film}>
      <LightRays at={[36, 66]} />
      <div className={`page ${styles.inner}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <T value={film.title} locale={lang} />
          </h1>
          {film.workingTitle && <p className={styles.working}>{t.film.workingTitle}</p>}
          {film.synopsis && (
            <p className={styles.synopsis}>
              <T value={film.synopsis} locale={lang} />
            </p>
          )}
        </header>
        <FilmPlayer {...await filmForPlayer(film, lang)} headingLevel={2} />
        {film.credits && film.credits.length > 0 && (
          <dl className={styles.credits}>
            {film.credits.map((c) => (
              <div key={`${c.name}-${text(c.role, lang)}`}>
                <dt>
                  <T value={c.role} locale={lang} />
                </dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </dl>
        )}
        <EditorNote locale={lang}>
          {film.status !== "available"
            ? "Когато интервюто е готово: добавете постер, видео файлове, субтитри (.vtt), части и текст в src/content/films.ts — вижте docs/assets.md."
            : null}
        </EditorNote>
      </div>
    </article>
  );
}
