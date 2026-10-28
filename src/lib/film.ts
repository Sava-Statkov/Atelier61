import type { FilmLabels, FilmPlayerData } from "@/components/film/FilmPlayer";
import type { Film } from "@/content/types";
import { href, text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getArtwork, getSeries } from "./artworks/queries";
import { nameOf } from "./artworks/map";
import { getStory } from "./content";
import { seriesPath } from "./paths";
import { isImagePublishable } from "./publish";

/** Prepares a film for the client player: resolves texts, poster and chapter links on the server. */
export async function filmForPlayer(film: Film, locale: Locale): Promise<{ film: FilmPlayerData; labels: FilmLabels }> {
  const t = getDictionary(locale).film;
  const poster = film.poster && isImagePublishable(film.poster) ? film.poster : undefined;

  const links = async (c: NonNullable<Film["chapters"]>[number]) => [
    ...(await Promise.all((c.series ?? []).map(getSeries)))
      .filter((s) => s !== undefined)
      .map((s) => ({ href: href(locale, seriesPath(s)), label: text(s.title, locale) })),
    ...(await Promise.all((c.artworks ?? []).map(getArtwork)))
      .filter((a) => a !== null)
      .map((a) => ({ href: href(locale, `/tvorbi/${a.slug}`), label: text(nameOf(a), locale) })),
    ...(c.stories ?? []).map(getStory).filter((s) => s !== undefined).map((s) => ({ href: href(locale, `/istorii/${s.slug}`), label: text(s.title, locale) })),
  ];
  const chapters = await Promise.all(
    (film.chapters ?? []).map(async (c) => ({ start: c.start, title: text(c.title, locale), links: await links(c) })),
  );

  return {
    film: {
      status: film.status,
      title: text(film.title, locale),
      poster: poster && {
        src: poster.src.src,
        width: poster.src.width,
        height: poster.src.height,
        alt: text(poster.alt, locale),
        blur: poster.src.blurDataURL ?? "",
      },
      sources: film.sources ?? [],
      tracks: film.tracks ?? [],
      chapters,
      transcript: (film.transcript ?? []).map((l) => ({ start: l.start, speaker: l.speaker, text: text(l.text, locale) })),
    },
    labels: {
      planned: t.planned,
      inProduction: t.inProduction,
      play: t.play,
      chapters: t.chapters,
      transcript: t.transcript,
      related: t.related,
      noSound: t.noSound,
    },
  };
}
