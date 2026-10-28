import type { Quote } from "./types";

/**
 * The artist's own words, exactly as published. Short excerpts only, always with their source.
 * Never paraphrase into quotation marks and never write new quotes for him.
 * When he approves or corrects a quote, change `verification.status` to "confirmed".
 */
export const quotes: Quote[] = [
  {
    id: "tanc-publikata",
    text: { bg: "Това са картини, направени заради публиката ми. Тя ги поиска" },
    speaker: "artist",
    context: { bg: "за изложбата „Танц“" },
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "tanc-risunkata",
    text: { bg: "Тук по-скоро обръщам внимание на рисунката и на мига в движението на една фигура." },
    speaker: "artist",
    context: { bg: "за изложбата „Танц“" },
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "tanc-dvizhenie",
    text: { bg: "Дори и мисловно да танцува човек не е лошо, защото това е движение, а движението е живот!" },
    speaker: "artist",
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "zhivo-instrumenti",
    text: { bg: "Аз успявам да чувам всеки инструмент поотделно и когато рисувам, това ми помага" },
    speaker: "artist",
    context: { bg: "за рисуването на сцена с музиканти" },
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "zhivo-bez-izmama",
    text: { bg: "Няма лъжа, няма измама и това е прекрасно." },
    speaker: "artist",
    context: { bg: "за рисуването на живо пред публика" },
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "tvorba-misal",
    text: { bg: "Създаването на каквато и да е творба започва първо с мисъл." },
    speaker: "artist",
    source: "rb-2024-tanc",
    verification: { status: "sourced", sources: ["rb-2024-tanc"] },
  },
  {
    id: "kone-prepuskasht",
    text: { bg: "Да рисуваш препускащ кон е една от най-трудните за рисуване картини." },
    speaker: "artist",
    context: { bg: "за изложбата „Януарски коне“" },
    source: "bnr-2026-kone",
    verification: { status: "sourced", sources: ["bnr-2026-kone"] },
  },
  {
    id: "sharzhove-istoriya",
    text: { bg: "рисувана история на България" },
    speaker: "artist",
    context: { bg: "така нарича шаржовете си от годините на прехода" },
    source: "epoch-2025-sharzhove",
    verification: { status: "sourced", sources: ["epoch-2025-sharzhove"] },
  },
];
