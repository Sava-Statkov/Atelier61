import type { SeriesText } from "./types";

const rb = ["rb-2024-tanc"];
const epoch = ["epoch-2025-sharzhove"];
const naim = ["naim-2007"];
const kone = ["bnr-2026-kone"];

/**
 * The sourced texts of the cycles and long-running projects: facts, the artist's words, periods and
 * how each is presented. Names, descriptions, order and representative works are in the database
 * (table `cycles`, managed in /admin) and are matched to these entries by slug.
 * Texts are plain summaries of the cited sources; replace them with the artist's own wording once he
 * has reviewed them. Entries with `kind: "practice"` are shown after the cycles, on their own address.
 */
export const series: SeriesText[] = [
  {
    slug: "kamennata-kniga-na-balgariya",
    period: { start: { year: 2007 } },
    facts: [
      { text: { bg: "В изложбата от април 2007 г. са показани петнадесет маслени платна." }, verification: { status: "sourced", sources: naim } },
      {
        text: { bg: "Живописта в цикъла е вдъхновена от археологическото наследство на България." },
        voice: "artist",
        verification: { status: "sourced", sources: naim },
      },
      {
        text: { bg: "Едно от платната е дарено на Столичната община по повод 128 години от обявяването на София за столица." },
        verification: { status: "sourced", sources: naim },
      },
      { text: { bg: "Маслената картина „Конник“ е част от цикъла." }, verification: { status: "sourced", sources: kone } },
    ],
    composition: "wall",
    room: "hall",
    exhibitions: ["naim-2007"],
    verification: { status: "sourced", sources: [...naim, ...epoch] },
  },
  {
    slug: "sharzhove-na-prehoda",
    period: { start: { year: 1991, approximate: true } },
    facts: [
      { text: { bg: "Първият му шарж е на Андрей Луканов, по покана на журналиста и издател Степан Ерамян." }, verification: { status: "sourced", sources: epoch } },
      {
        text: { bg: "Заради лошия печат във вестниците преминава от молив към туш и перо." },
        verification: { status: "sourced", sources: epoch },
      },
      {
        text: { bg: "По покана на Гиньо Ганев рисува седмични композиции за вестник „Дебати“ и започва да работи в парламента." },
        verification: { status: "sourced", sources: epoch },
      },
      {
        text: { bg: "Карикатурата е моментна, а шаржът може да оцелее във времето и да стане част от историческа композиция." },
        voice: "artist",
        verification: { status: "sourced", sources: epoch },
      },
      {
        text: { bg: "Спира с политическите шаржове по времето на 39-ото Народно събрание." },
        verification: { status: "sourced", sources: epoch },
      },
      {
        text: { bg: "Пази над сто шаржа, върху които нарисуваните са му написали послания." },
        verification: { status: "sourced", sources: epoch },
      },
    ],
    composition: "salon",
    room: "hall",
    quotes: ["sharzhove-istoriya"],
    exhibitions: ["parlamentarna-prikazka-1992", "sharzhove-2025"],
    verification: {
      status: "sourced",
      sources: epoch,
      note: "Началната година е ориентировъчна: източникът споменава активна гражданска позиция чрез рисунки и шаржове от 1991 г.",
    },
  },
  {
    slug: "tanc",
    period: { start: { year: 2024 } },
    facts: [
      {
        text: { bg: "Продължение е на цикъла „Капризен вихър от щрихи“, показан година по-рано в същата галерия." },
        verification: { status: "sourced", sources: rb },
      },
      {
        text: { bg: "Използва простотата, за да подчертае линията и движението." },
        voice: "artist",
        verification: { status: "sourced", sources: rb },
      },
    ],
    composition: "sequence",
    room: "hall",
    quotes: ["tanc-publikata", "tanc-risunkata", "tanc-dvizhenie"],
    exhibitions: ["kaprizen-vihar-2023", "tanc-2024"],
    verification: { status: "sourced", sources: rb },
  },
  {
    slug: "yanuarski-kone",
    period: { start: { year: 2026 } },
    facts: [
      {
        text: { bg: "Яздил е и неведнъж е ходил в конна база на Витоша, за да наблюдава конете." },
        voice: "artist",
        verification: { status: "sourced", sources: kone },
      },
      {
        text: { bg: "В центъра на галерията е маслената картина „Конник“ от цикъла „Каменната книга на България“." },
        verification: { status: "sourced", sources: kone },
      },
    ],
    composition: "sequence",
    room: "hall",
    quotes: ["kone-prepuskasht"],
    exhibitions: ["yanuarski-kone-2026"],
    verification: { status: "sourced", sources: kone },
  },
  {
    slug: "poslanie-kam-sveta",
    period: { start: { year: 1993 } },
    composition: "wall",
    room: "hall",
    verification: { status: "sourced", sources: epoch, note: "Нужни са описание, брой листове и мястото на представяне." },
  },
  {
    slug: "portreti",
    facts: [
      {
        text: { bg: "Рисувал е и портретите на Св. София, Томас Джеферсън, Мария Монтесори, хан Кубрат, Давид Сасунски и Кольо Фичето." },
        verification: { status: "sourced", sources: epoch },
      },
    ],
    composition: "salon",
    room: "hall",
    verification: { status: "sourced", sources: epoch, note: "Години и заглавия на отделните цикли предстои да се уточнят." },
  },
  {
    slug: "risuvane-na-zhivo",
    kind: "practice",
    period: { start: { year: 1994 } },
    facts: [
      {
        text: {
          bg: "Първият му опит да „преведе“ класическа и народна българска музика в изображение е върху стъкло, по покана на Нери Терзиева и Хачо Бояджиев.",
        },
        verification: { status: "sourced", sources: rb },
      },
      {
        text: { bg: "През 1994 г. рисува на живо в проект на БНТ под музиката на ансамбъл „Филип Кутев“ и Борис Христов." },
        verification: { status: "sourced", sources: rb },
      },
      {
        text: { bg: "През 2024 г. рисува на сцена с Фани Куцарова (пиано), Венци Трифонов и Мартин Владимиров (гъдулка) в Бургас, Прага и София." },
        verification: { status: "sourced", sources: rb },
      },
      {
        text: { bg: "Нарисуваните на сцената в Прага акварели посетителите са можели да купят за символична сума." },
        verification: { status: "sourced", sources: rb },
      },
    ],
    composition: "stage",
    room: "stage",
    quotes: ["zhivo-instrumenti", "zhivo-bez-izmama"],
    exhibitions: ["bnt-1994", "zografi-burgas-2024", "piazzolla-praga-2024", "zografi-sofia-2024"],
    verification: { status: "sourced", sources: rb },
  },
];
