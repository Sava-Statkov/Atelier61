/**
 * Content model for the Rumen Statkov site.
 *
 * Content (what is true about the artist and his work) lives in `src/content/*.ts`.
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

export type ImageAsset = {
  /** Path under `/public`, e.g. `/media/artworks/konnik/konnik.jpg`. Dimensions come from the media manifest. */
  src: string;
  alt: Localized;
  credit?: string;
  rights: RightsStatus;
  /** Focal point (0–1) used when the image is cropped. */
  focal?: { x: number; y: number };
};

/** A region of an artwork worth looking at closely. Coordinates are fractions of the image (0–1). */
export type ArtworkDetail = {
  id: string;
  region: { x: number; y: number; width: number; height: number };
  caption: Localized;
  voice?: Voice;
  /** A story that starts from this detail. */
  story?: string;
  verification: Verification;
};

export type Medium =
  | "oil"
  | "watercolour"
  | "ink"
  | "graphic"
  | "glass"
  | "caricature"
  | "drawing"
  | "mixed"
  | "set-design"
  | "illustration";

export type Artwork = {
  slug: string;
  title: Localized;
  date?: PartialDate | DateRange;
  /** Exact technique as the artist states it, e.g. "масло върху платно". */
  technique?: Localized;
  media?: Medium[];
  dimensions?: { heightCm: number; widthCm: number; depthCm?: number };
  /** Series slugs. */
  series?: string[];
  /** First image is the main view. Empty → a labelled raw-canvas placeholder. */
  images: ImageAsset[];
  /** Aspect ratio (width / height) for the placeholder while no photograph exists. */
  placeholderRatio?: number;
  /** One to three plain sentences shown under the work in the list of works. */
  summary?: Localized;
  description?: Block[];
  details?: ArtworkDetail[];
  /** Public collection, if the owner agrees to be named. */
  collection?: Localized;
  exhibitions?: string[];
  stories?: string[];
  related?: string[];
  /** Show a discreet enquiry link (only when a contact e-mail is set in `site.ts`). */
  enquiries?: boolean;
  /** Fields that exist but are not verified yet — hidden in production, flagged in development. */
  pending?: Array<"date" | "technique" | "dimensions" | "collection">;
  verification: Verification;
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

export type Series = {
  slug: string;
  /**
   * `cycle` (default): a body of work, listed under "Цикли".
   * `practice`: a way of working that runs through many years, such as painting live with
   * musicians; shown on its own, after the cycles.
   */
  kind?: "cycle" | "practice";
  title: Localized;
  period?: DateRange;
  /** One or two plain sentences. */
  summary: Localized;
  facts?: Fact[];
  body?: Block[];
  composition: Composition;
  room?: Room;
  /** Quote ids. */
  quotes?: string[];
  exhibitions?: string[];
  /** Artwork slug used as the series cover. */
  cover?: string;
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
  | { type: "artwork"; slug: string; detail?: string; caption?: Localized }
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
  | { kind: "detail"; artwork: string; detail: string }
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
