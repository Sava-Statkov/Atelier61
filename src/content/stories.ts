import type { Story } from "./types";

const epoch = ["epoch-2025-sharzhove"];
const rb = ["rb-2024-tanc"];

/**
 * Editorial stories. Each one starts from something concrete — a question, a detail, a quote —
 * and leads into works, series and events. Both stories below are retold from published sources
 * and wait for the artist's review (`editorial: "review"`), so they appear in development only.
 */
export const stories: Story[] = [
  {
    slug: "parlamentat-v-kartinki",
    title: { bg: "Как шаржовете влязоха в парламента" },
    lead: { bg: "Първата изложба на шаржове в Народното събрание е открита на 15 юли 1992 г. Идеята не е на художника." },
    opening: { kind: "question", text: { bg: "Чия е идеята за изложба на шаржове в сградата на парламента?" } },
    body: [
      {
        type: "p",
        text: {
          bg: "Идеята за първата изложба в парламента е на човек от охраната. Тогавашният председател Стефан Савов първоначално е скептичен, но се съгласява, след като вижда и себе си в шаржовете.",
        },
        sources: epoch,
      },
      {
        type: "p",
        text: {
          bg: "„Парламентарна приказка в картинки“ е открита на 15 юли 1992 г. Депутатите от БСП напускат залата и изложбата открива заместник-председателят Снежана Ботушарова.",
        },
        sources: epoch,
      },
      {
        type: "p",
        voice: "artist",
        text: {
          bg: "Стремял се е да представя всички политически сили равностойно. Парламентът нарича свой „втори дом“ през годините на прехода.",
        },
        sources: epoch,
      },
      { type: "quote", quote: "sharzhove-istoriya" },
    ],
    series: ["sharzhove-na-prehoda"],
    editorial: "review",
    verification: { status: "sourced", sources: epoch },
  },
  {
    slug: "da-chuesh-vseki-instrument",
    title: { bg: "Да чуеш всеки инструмент" },
    lead: { bg: "От 1994 г. Румен Статков рисува на сцена, докато музикантите свирят." },
    opening: { kind: "quote", quote: "zhivo-instrumenti" },
    body: [
      {
        type: "p",
        text: {
          bg: "Първият му опит да превърне класическа и народна музика в изображение е върху стъкло. През 1994 г. рисува на живо в проект на БНТ под музиката на ансамбъл „Филип Кутев“ и Борис Христов.",
        },
        sources: rb,
      },
      {
        type: "p",
        text: {
          bg: "През 2024 г. тези концерти стават основа на фестивала „Музикални зографи“ — в Бургас, Прага и София, с Фани Куцарова, Венци Трифонов и Мартин Владимиров.",
        },
        sources: rb,
      },
      { type: "quote", quote: "zhivo-bez-izmama" },
    ],
    series: ["risuvane-na-zhivo"],
    editorial: "review",
    verification: { status: "sourced", sources: rb },
  },
];
