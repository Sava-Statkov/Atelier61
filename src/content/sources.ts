import type { Source } from "./types";

/**
 * Publications and other sources that claims on the site point to.
 * A `sourced` fact must cite at least one id from this list (checked by `content.test.ts`).
 *
 * These are research starting points, not artist-approved texts. Do not reuse their photographs.
 */
export const sources: Source[] = [
  {
    id: "naim-2007",
    kind: "institution",
    title: "„Каменната книга на България“ беше показана в Националния археологически музей",
    outlet: "Национален археологически институт с музей при БАН",
    date: { year: 2007, month: 4, day: 26 },
    url: "https://naim.bg/bg/content/news/600/860/97/",
    accessed: "2026-10-27",
    language: "bg",
  },
  {
    id: "rb-2024-tanc",
    kind: "radio",
    title: "Художникът Румен Статков в нов „Танц“ със своята публика",
    outlet: "Радио България, БНР",
    author: "БНР екип",
    date: { year: 2024, month: 10, day: 22 },
    url: "https://bnrnews.bg/radiobulgaria/post/38627/hudojnikat-rumen-statkov-v-nov-tanc-sas-svoata-publika",
    accessed: "2026-10-27",
    language: "bg",
  },
  {
    id: "epoch-2025-sharzhove",
    kind: "press",
    title: "Художникът Румен Статков изложи „Историческите шаржове на прехода – 35 години от началото“",
    outlet: "Epoch Times България",
    author: "Гергана Костова",
    date: { year: 2025, month: 11, day: 11 },
    url: "https://epochtimes.bg/hudozhnikat-rumen-statkov-izlozhi-istoricheskite-sharzhove-na-prehoda-35-godini-ot-nachaloto/",
    accessed: "2026-10-27",
    language: "bg",
  },
  {
    id: "bnr-2026-kone",
    kind: "radio",
    title: "Румен Статков представя изложбата си „Януарски коне“",
    outlet: "БНР, програма „Христо Ботев“, „Артефир“",
    author: "Росица Михова (публикация), разговор: Димитрина Кюркчиева",
    date: { year: 2026, month: 2, day: 2 },
    url: "https://bnrnews.bg/hristobotev/post/422505/rumen-statkov-predstavya-izlozhbata-si-yanuarski-kone",
    accessed: "2026-10-27",
    language: "bg",
  },
  {
    id: "family-2026",
    kind: "family",
    title: "Сведения, предоставени от семейството на художника при подготовката на сайта",
    outlet: "Семейството на художника",
    date: { year: 2026, month: 10 },
    language: "bg",
  },
];
