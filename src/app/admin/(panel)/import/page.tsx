import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { Importer } from "./Importer";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Масов импорт" };

export default async function ImportPage() {
  const { db } = await requireAdmin();
  const [categories, cycles] = await Promise.all([
    db.from("categories").select("id, name").order("sort_order"),
    db.from("cycles").select("id, name").order("sort_order"),
  ]);
  return (
    <>
      <h1 className={styles.title}>Масов импорт</h1>
      <p className={styles.lead}>
        Всяка снимка става отделна творба-чернова. Нищо не се публикува само: после попълнете известното и публикувайте от
        списъка (може и много наведнъж). Снимка, която вече е в архива, се разпознава и пропуска, затова прекъснат импорт
        може просто да се пусне отново със същата папка. Снимките се обработват в браузъра; оригиналите остават у вас.
      </p>
      <Importer
        categories={(categories.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
        cycles={(cycles.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
