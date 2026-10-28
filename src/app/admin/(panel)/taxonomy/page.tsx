import type { Metadata } from "next";
import { series } from "@/content/series";
import { requireAdmin } from "@/lib/admin/auth";
import { TermForm } from "./TermForm";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Категории и цикли" };

export default async function TaxonomyPage() {
  const { db } = await requireAdmin();
  const [categories, cycles, works] = await Promise.all([
    db.from("categories").select("id, name, slug, sort_order").order("sort_order"),
    db.from("cycles").select("id, name, slug, sort_order, description").order("sort_order"),
    db.from("artworks").select("category_id, cycle_id"),
  ]);
  const count = (key: "category_id" | "cycle_id", id: string) => (works.data ?? []).filter((w) => w[key] === id).length;
  const withTexts = new Set(series.map((s) => s.slug));

  return (
    <>
      <h1 className={styles.title}>Категории и цикли</h1>
      <p className={styles.lead}>
        Категория е видът творба (Живопис, Акварел…). Цикъл е група творби, създадени като едно цяло. Изложбите са отделно,
        в летописа. Редът определя реда на филтрите и на стаите на началната страница.
      </p>

      <h2 className={styles.subtitle}>Категории</h2>
      {(categories.data ?? []).map((c) => (
        <TermForm key={c.id} table="categories" term={{ ...c, works: count("category_id", c.id) }} />
      ))}
      <p className={styles.hint}>Нова категория:</p>
      <TermForm table="categories" />

      <h2 className={styles.subtitle}>Цикли</h2>
      <p className={styles.hint}>
        Фактите, цитатите и изложбите на цикъла с източници са в src/content/series.ts, по адреса на цикъла. Смяната на адреса
        ги откача; нов цикъл без такъв запис се показва само с името и описанието си.
      </p>
      {(cycles.data ?? []).map((c) => (
        <div key={c.id}>
          <TermForm table="cycles" term={{ ...c, works: count("cycle_id", c.id) }} />
          {!withTexts.has(c.slug) && <p className={styles.hint}>Без текстове в series.ts.</p>}
        </div>
      ))}
      <p className={styles.hint}>Нов цикъл:</p>
      <TermForm table="cycles" />
    </>
  );
}
