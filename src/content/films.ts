import type { Film } from "./types";

/**
 * Interviews and documentary films. The interview with the artist is planned but not filmed yet,
 * so it has no poster, footage, chapters or transcript. Fill them in when the material exists;
 * the player switches from the "planned" state on its own. See docs/assets.md → Видео.
 */
export const films: Film[] = [
  {
    slug: "intervyu",
    title: { bg: "Интервю с Румен Статков" },
    workingTitle: true,
    status: "planned",
    synopsis: { bg: "Разговор с художника, заснет от неговия син." },
    chapters: [],
    transcript: [],
    verification: { status: "confirmed", confirmedBy: "семейството на художника", sources: ["family-2026"] },
  },
];
