import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { ARTWORKS_BUCKET } from "@/lib/supabase/env";
import { UnusedFiles } from "./UnusedFiles";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Файлове" };

/** The Free plan includes 1 GB of storage. */
const STORAGE_LIMIT = 1024 ** 3;

const megabytes = (bytes: number) => `${(bytes / 1024 ** 2).toFixed(1)} MB`;

/** Space used in storage, and files no photograph refers to any more (e.g. after a failed delete). */
export default async function FilesPage() {
  const { db } = await requireAdmin();
  const bucket = db.storage.from(ARTWORKS_BUCKET);

  const objects: Array<{ name: string; size: number }> = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await bucket.list("", { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    objects.push(...data.filter((o) => o.id).map((o) => ({ name: o.name, size: Number(o.metadata?.size ?? 0) })));
    if (data.length < 1000) break;
  }
  // The database returns at most 1000 rows per request, so read the photographs page by page.
  const used = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("artwork_images").select("storage_path").order("id").range(from, from + 999);
    if (error) throw new Error(error.message);
    data.forEach((p) => used.add(p.storage_path));
    if (data.length < 1000) break;
  }
  const unused = objects.filter((o) => !used.has(o.name));
  const total = objects.reduce((n, o) => n + o.size, 0);

  return (
    <>
      <h1 className={styles.title}>Файлове</h1>
      <p className={styles.lead}>
        {objects.length} файла, {megabytes(total)} от {megabytes(STORAGE_LIMIT)} в безплатния план ({((total / STORAGE_LIMIT) * 100).toFixed(1)}%).
        Средно {objects.length ? megabytes(total / objects.length) : "0 MB"} на снимка.
      </p>
      <h2 className={styles.subtitle}>Неизползвани файлове</h2>
      <UnusedFiles files={unused.map((o) => ({ name: o.name, size: megabytes(o.size) }))} />
    </>
  );
}
