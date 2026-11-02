import type { StaticImageData } from "next/image";

/**
 * Content model for the editorial content of the Rumen Statkov site: biography, cycles' texts,
 * exhibitions, chronicle, quotes, sources, stories and films, in `src/content/*.ts`.
 * The works themselves, their photographs, categories and cycles are in the database (Supabase)
 * and are managed in /admin; see `src/lib/artworks`. Editorial records point to works by slug.
 * Presentation lives in `src/components`. Nothing in this folder knows about layout.
 *
 * Every record carries a `verification`. Only `confirmed` records, and `sourced` records with at
 * least one source, are published in a production build. See `src/lib/publish.ts`.
 */

/** Bulgarian is required; English is optional and is never generated automatically. */
export type Localized<T = string> = { bg: T; en?: T };

export type VerificationStatus =
  /** Confirmed by the artist or his family. */
  | "confirmed"
  /** Reported in a cited publication, not yet confirmed by the artist. Published with a citation. */
  | "sourced"
  /** Needs checking. Never published. */
  | "unconfirmed"
  /** Development scaffolding. Never published. */
  | "placeholder";

export type Verification = {
  status: VerificationStatus;
  /** Ids from `sources.ts`. */
  sources?: string[];
  /** Who confirmed it, e.g. "семейството на художника". */
  confirmedBy?: string;
  /** What exactly is uncertain or inferred. Shown to editors in development only. */
  note?: string;
};

/** A single statement that can be cited, e.g. "15 маслени платна". */
export type Fact = {
  text: Localized;
  /** Whose statement this is: a plain fact, the artist's own view (reported), or an interpretation. */
  voice?: Voice;
  verification: Verification;
};

/** Distinguishes facts, interpretations and the artist's own viewpoint on the page. */
export type Voice = "fact" | "artist" | "interpretation";

export type PartialDate = {
  year: number;
  month?: number;
  day?: number;
  /** "около" — the date is approximate. */
  approximate?: boolean;
};

export type DateRange = { start: PartialDate; end?: PartialDate };

export type RightsStatus =
  /** Photographed or owned by the artist / family — may be published. */
  | "artist"
  /** Third-party photo with written permission — record the licence in `credit`. */
  | "licensed"
  /** Unknown provenance — never published. */
  | "unknown";

/**
 * A photograph in the editorial content (the artist's portrait, a film poster, a picture in a story).
 * Photographs of the works are not here: they live in Supabase Storage, see src/lib/artworks.
 */
export type ImageAsset = {
  /** A static import from src/assets, e.g. `import portrait from "@/assets/photos/rumen-statkov.png"`. Next.js reads its size and blur from the file. */
  src: StaticImageData;
  alt: Localized;
  credit?: string;
  rights: RightsStatus;
};

/**
 * How a series is hung. Chosen from the nature of the work, not for variety:
 * - `wall`: few, large works with room around them
 * - `salon`: many small works hung densely
 * - `sequence`: works read one after another, as movement
 * - `stage`: work made in front of an audience
 */
export type Composition = "wall" | "salon" | "sequence" | "stage";

/** Visual environments defined in `src/styles/rooms.css`. */
export type Room = "hall" | "stage" | "paper";

/**
 * The editorial side of a cycle: sourced facts, the artist's words and how the cycle is presented.
 * Its name, description and representative work are in the database (table `cycles`), matched by
 * `slug`; a cycle added in the admin without an entry here is shown with defaults.
 */
export type SeriesText = {
  slug: string;
  /**
   * `cycle` (default): a body of work, listed under "Цикли".
   * `practice`: a way of working that runs through many years, such as painting live with
   * musicians; shown on its own, after the cycles.
   */
  kind?: "cycle" | "practice";
  period?: DateRange;
  facts?: Fact[];
  body?: Block[];
  composition: Composition;
  room?: Room;
  /** Quote ids. */
  quotes?: string[];
  exhibitions?: string[];
  /** Sources of the description in the database and of the facts here. */
  verification: Verification;
};

export type EventKind = "life" | "education" | "work" | "exhibition" | "performance" | "civic" | "media";

export type LifeEvent = {
  id: string;
  /** Leave out when unknown — the event is listed under "без точна дата" instead of guessing. */
  date?: PartialDate | DateRange;
  title: Localized;
  text?: Localized;
  kind: EventKind;
  series?: string[];
  artworks?: string[];
  stories?: string[];
  exhibition?: string;
  verification: Verification;
};

export type Exhibition = {
  id: string;
  title: Localized;
  kind: "solo" | "group" | "performance" | "festival";
  dates: DateRange;
  venue: Localized;
  city?: Localized;
  country?: Localized;
  summary?: Localized;
  series?: string[];
  artworks?: string[];
  verification: Verification;
};

/** An idea for a future exhibition. Not an announced event: those go in `exhibitions.ts`. */
export type FutureIdea = {
  id: string;
  title: Localized;
  text?: Localized;
  verification: Verification;
};

export type Quote = {
  id: string;
  text: Localized;
  /** "artist" or the name of another speaker. */
  speaker: "artist" | string;
  /** What he was talking about. */
  context?: Localized;
  source: string;
  verification: Verification;
};

export type SourceKind = "press" | "radio" | "tv" | "institution" | "catalogue" | "book" | "family" | "artist";

export type Source = {
  id: string;
  kind: SourceKind;
  /** Title in the original language. */
  title: string;
  outlet: string;
  author?: string;
  date?: PartialDate;
  url?: string;
  /** ISO date the URL was last checked. */
  accessed?: string;
  language: "bg" | "en" | string;
};

export type Block =
  | { type: "p"; text: Localized; voice?: Voice; sources?: string[] }
  | { type: "heading"; text: Localized }
  | { type: "quote"; quote: string }
  /** A work from the database, by slug. */
  | { type: "artwork"; slug: string; caption?: Localized }
  | { type: "image"; image: ImageAsset; caption?: Localized }
  | { type: "facts"; items: Fact[] };

export type FilmStatus = "planned" | "in-production" | "available";

export type FilmChapter = {
  /** Seconds from the start. */
  start: number;
  title: Localized;
  series?: string[];
  artworks?: string[];
  stories?: string[];
};

export type Film = {
  slug: string;
  title: Localized;
  /** Marks a title as provisional until the film is finished. */
  workingTitle?: boolean;
  status: FilmStatus;
  synopsis?: Localized;
  poster?: ImageAsset;
  /** Self-hosted files (keep large files on a video host or CDN, see docs/assets.md). */
  sources?: Array<{ src: string; type: string }>;
  durationSeconds?: number;
  tracks?: Array<{ src: string; srclang: string; label: string; kind: "subtitles" | "captions"; default?: boolean }>;
  chapters?: FilmChapter[];
  transcript?: Array<{ start?: number; speaker?: string; text: Localized }>;
  credits?: Array<{ role: Localized; name: string }>;
  verification: Verification;
};

export type StoryOpening =
  | { kind: "question"; text: Localized }
  | { kind: "quote"; quote: string }
  | { kind: "event"; event: string };

export type Story = {
  slug: string;
  title: Localized;
  /** One sentence under the title. */
  lead?: Localized;
  opening: StoryOpening;
  body: Block[];
  series?: string[];
  artworks?: string[];
  events?: string[];
  /** Editorial state, independent of fact verification. Only `published` stories reach production. */
  editorial: "draft" | "review" | "published";
  verification: Verification;
};
