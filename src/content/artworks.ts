import type { Artwork } from "./types";

/**
 * Artworks. To add one, copy an entry, put the photograph in `public/media/artworks/<slug>/`
 * and run `npm run media` (also runs automatically before `dev` and `build`).
 * Full instructions: docs/assets.md.
 */
export const artworks: Artwork[] = [
  {
    slug: "konnik",
    title: { bg: "Конник" },
    technique: { bg: "масло" },
    media: ["oil"],
    series: ["kamennata-kniga-na-balgariya", "yanuarski-kone"],
    images: [],
    exhibitions: ["yanuarski-kone-2026"],
    enquiries: true,
    pending: ["date", "dimensions"],
    verification: { status: "sourced", sources: ["bnr-2026-kone"] },
  },
  {
    slug: "okoto-na-sveta",
    title: { bg: "Окото на света" },
    images: [],
    verification: {
      status: "sourced",
      sources: ["epoch-2025-sharzhove"],
      note: "Известни са само заглавието и връзката с асамблеята на НАТО през 1998 г. Техника, година и размер липсват.",
    },
  },
];

/**
 * Development-only stand-ins to test compositions. They render as labelled raw canvas, never as art,
 * and are dropped from production builds by `isPublishable`.
 */
export const placeholderArtworks: Artwork[] = [
  ...[0.8, 1, 1.25, 0.75, 1.5, 0.7, 1, 0.8, 1.33].map((ratio, i): Artwork => ({
    slug: `myasto-${i + 1}`,
    title: { bg: `Място за творба ${i + 1}` },
    images: [],
    placeholderRatio: ratio,
    series: [["sharzhove-na-prehoda", "tanc", "kamennata-kniga-na-balgariya", "yanuarski-kone", "portreti"][i % 5]],
    verification: { status: "placeholder", note: "Работно място за тест на композицията." },
  })),
];
