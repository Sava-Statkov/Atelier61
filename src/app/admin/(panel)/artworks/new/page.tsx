import type { Metadata } from "next";
import Link from "next/link";
import { sources } from "@/content/sources";
import { requireAdmin } from "@/lib/admin/auth";
import { ArtworkForm } from "../ArtworkForm";
import styles from "../../../admin.module.css";

export const metadata: Metadata = { title: "Нова творба" };

/** A new work; its photographs are added on the next page, once it is saved. For many photographs at once, use the import. */
export default async function NewArtworkPage() {
  const { db } = await requireAdmin();
  const [categories, cycles] = await Promise.all([
    db.from("categories").select("id, name").order("sort_order"),
    db.from("cycles").select("id, name").order("sort_order"),
  ]);
  return (
    <>
      <p className={styles.hint}>
        <Link href="/admin">← Всички творби</Link>
      </p>
      <h1 className={styles.title}>Нова творба</h1>
      <p className={styles.lead}>
        Попълнете само известното. Снимките се добавят след като творбата е създадена. За много снимки наведнъж използвайте{" "}
        <Link href="/admin/import">масовия импорт</Link>.
      </p>
      <ArtworkForm
        work={null}
        categories={(categories.data ?? []).map((c) => ({ id: c.id, label: c.name }))}
        cycles={(cycles.data ?? []).map((c) => ({ id: c.id, label: c.name }))}
        sources={sources.map((s) => ({ id: s.id, label: `${s.outlet}: ${s.title}` }))}
        hasPhotos={false}
      />
    </>
  );
}
