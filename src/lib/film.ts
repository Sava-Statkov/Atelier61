import type { FilmLabels, FilmPlayerData } from "@/components/film/FilmPlayer";
import type { Film } from "@/content/types";
import { href, text, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveImage } from "./artwork";
import { getArtwork, getSeries, getStory } from "./content";
import { seriesPath } from "./paths";
import { isImagePublishable } from "./publish";

/** Prepares a film for the client player: resolves texts, poster and chapter links on the server. */
export function filmForPlayer(film: Film, locale: Locale): { film: FilmPlayerData; labels: FilmLabels } {
  const t = getDictionary(locale).film;
  const poster = film.poster && isImagePublishable(film.poster) ? resolveImage(film.poster) : undefined;

  const links = (c: NonNullable<Film["chapters"]>[number]) => [
    ...(c.series ?? []).map(getSeries).filter((s) => s !== undefined).map((s) => ({ href: href(locale, seriesPath(s)), label: text(s.title, locale) })),
    ...(c.artworks ?? []).map(getArtwork).filter((a) => a !== undefined).map((a) => ({ href: href(locale, `/tvorbi/${a.slug}`), label: text(a.title, locale) })),
    ...(c.stories ?? []).map(getStory).filter((s) => s !== undefined).map((s) => ({ href: href(locale, `/istorii/${s.slug}`), label: text(s.title, locale) })),
  ];

  return {
    film: {
      status: film.status,
      title: text(film.title, locale),
      poster: poster && { src: poster.src, width: poster.width, height: poster.height, alt: text(poster.alt, locale), blur: poster.blur },
      sources: film.sources ?? [],
      tracks: film.tracks ?? [],
      chapters: (film.chapters ?? []).map((c) => ({ start: c.start, title: text(c.title, locale), links: links(c) })),
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
