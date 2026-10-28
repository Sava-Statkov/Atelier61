import type { LifeEvent } from "./types";

const epoch = ["epoch-2025-sharzhove"];

/**
 * Life and career events for the chronicle (Летопис). Exhibitions from `exhibitions.ts` are merged
 * in automatically, so only add events here that are not exhibitions.
 */
export const timeline: LifeEvent[] = [
  {
    id: "rozhden",
    date: { year: 1961, month: 4, day: 23 },
    title: { bg: "Роден в Бургас" },
    kind: "life",
    verification: { status: "sourced", sources: [...epoch, "rb-2024-tanc", "family-2026"] },
  },
  {
    id: "obrazovanie",
    title: { bg: "Завършва Националното училище за изящни изкуства „Илия Петров“ и Националната художествена академия в София" },
    kind: "education",
    verification: {
      status: "sourced",
      sources: [...epoch, "family-2026"],
      note: "Годините на обучение липсват — събитието стои без дата, докато не се уточнят.",
    },
  },
  {
    id: "grazhdanska-poziciya-1991",
    date: { year: 1991 },
    title: { bg: "Рисунки, шаржове и композиции с активна гражданска позиция" },
    kind: "civic",
    series: ["sharzhove-na-prehoda"],
    verification: { status: "sourced", sources: epoch },
  },
  {
    id: "poslanie-1993",
    date: { year: 1993 },
    title: { bg: "Представя графичния проект „Послание към света“" },
    kind: "work",
    series: ["poslanie-kam-sveta"],
    verification: { status: "sourced", sources: epoch },
  },
  {
    id: "gerb-1995",
    date: { year: 1995 },
    title: { bg: "Представя проект за нов национален герб на България" },
    text: { bg: "По думите му проектът по-късно изчезва от президентството." },
    kind: "civic",
    verification: { status: "sourced", sources: epoch },
  },
  {
    id: "bnt-filmi",
    date: { start: { year: 1995, approximate: true } },
    title: { bg: "Създава няколко филма заедно с БНТ" },
    kind: "media",
    verification: { status: "sourced", sources: epoch, note: "Източникът казва „в средата на 90-те“." },
  },
  {
    id: "nato-1998",
    date: { year: 1998 },
    title: { bg: "Одобрена е негова идея, свързана с произведението „Окото на света“" },
    text: { bg: "На 44-тата Генерална асамблея на НАТО в Лисабон." },
    kind: "work",
    artworks: ["okoto-na-sveta"],
    verification: { status: "sourced", sources: epoch },
  },
  {
    id: "moskva-2006",
    date: { year: 2006 },
    title: { bg: "Работи с Българския културен център и посолството на България в Москва" },
    kind: "work",
    verification: { status: "sourced", sources: epoch },
  },
];
