import portrait from "@/assets/photos/rumen-statkov.png";
import type { Fact, ImageAsset, Localized } from "./types";

/**
 * Site-wide facts. `null` means "not known yet" — the related UI stays hidden until it is set.
 * Nothing here may be guessed.
 */
export const site = {
  name: { bg: "Румен Статков", en: "Rumen Statkov" } satisfies Localized,
  /** The mark in the header. Alternative spelling: "Atelier 61". */
  brand: "Ателие 61",
  /**
   * Browser tab titles: "Румен Статков" now. Set to true at launch to show both names,
   * e.g. "Творби — Румен Статков | Atelier 61".
   */
  brandInTitle: false,
  /** Short line under the name on the home page, in the family's words. */
  line: { bg: "Български художник - Творчество, история и съвременност" } satisfies Localized,
  /**
   * Photograph of the artist in "Повече за художника" (file in src/assets/photos/, supplied by the family).
   * Add `credit: "Снимка: …"` once the photographer is known. With `null`, a labelled empty frame
   * stands in its place.
   */
  portrait: {
    src: portrait,
    alt: { bg: "Румен Статков" },
    rights: "artist",
  } as ImageAsset | null,
  contact: {
    /** E-mail for galleries, collectors, curators and journalists. */
    email: null as string | null,
    phone: null as string | null,
    /** Full URL of the artist's Facebook page (a page named "Rumen Statkov" is mentioned in the press). */
    facebook: null as string | null,
  },
};

/** Short biography as separate, individually sourced statements. */
export const biography: Fact[] = [
  {
    text: { bg: "Роден е на 23 април 1961 г. в Бургас." },
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove", "rb-2024-tanc", "family-2026"] },
  },
  {
    text: { bg: "Завършил е Националното училище за изящни изкуства „Илия Петров“ и Националната художествена академия в София." },
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove", "family-2026"] },
  },
  {
    text: {
      bg: "Работи в живопис, акварел, графика, рисунка, шарж, комикс и стъклопис, прави сценография за театрални постановки и илюстрира книги за деца и възрастни.",
    },
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove"] },
  },
  {
    text: { bg: "Има над 70 самостоятелни изложби." },
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove"] },
  },
  {
    text: { bg: "Негови творби са в галерии и частни колекции в много страни." },
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove"], note: "Конкретни галерии и колекции предстои да се посочат." },
  },
];
