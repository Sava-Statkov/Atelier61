import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { photoUrl } from "@/lib/supabase/env";
import { ArtworkList, type ListedWork } from "./ArtworkList";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Творби" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** All works, drafts included, in the order of the site; search and filters narrow the list. */
export default async function WorksAdminPage({ searchParams }: PageProps<"/admin">) {
  const { db } = await requireAdmin();
  const search = await searchParams;
  const q = first(search.q).trim();
  const status = first(search.status);
  const category = first(search.category);
  const cycle = first(search.cycle);
  const untitled = first(search.untitled) === "1";

  let query = db
    .from("artworks")
    .select("id, slug, title, year, technique, published, on_home, category_id, cycle_id, photos:artwork_images(storage_path, width, height, sort_order)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "photos" })
    .limit(1, { referencedTable: "photos" })
    .limit(1000);
  // Characters that would end PostgREST's filter syntax are dropped from the search text.
  const term = q.replace(/[,()*%"\\]/g, " ").trim();
  if (term) query = query.or(`title.ilike.*${term}*,slug.ilike.*${term}*,technique.ilike.*${term}*`);
  if (status === "published") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  if (category === "none") query = query.is("category_id", null);
  else if (category) query = query.eq("category_id", category);
  if (cycle === "none") query = query.is("cycle_id", null);
  else if (cycle) query = query.eq("cycle_id", cycle);
  if (untitled) query = query.is("title", null);

  const [works, categories, cycles, totals] = await Promise.all([
    query,
    db.from("categories").select("id, name").order("sort_order"),
    db.from("cycles").select("id, name, featured_artwork_id").order("sort_order"),
    db.from("artworks").select("published"),
  ]);
  if (works.error) throw new Error(works.error.message);

  const featured = new Set((cycles.data ?? []).map((c) => c.featured_artwork_id).filter(Boolean));
  const categoryName = new Map((categories.data ?? []).map((c) => [c.id, c.name]));
  const cycleName = new Map((cycles.data ?? []).map((c) => [c.id, c.name]));
  const listed: ListedWork[] = works.data.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    year: w.year,
    technique: w.technique,
    published: w.published,
    onHome: w.on_home,
    featured: featured.has(w.id),
    category: w.category_id ? (categoryName.get(w.category_id) ?? null) : null,
    cycle: w.cycle_id ? (cycleName.get(w.cycle_id) ?? null) : null,
    thumb: w.photos[0] ? { url: photoUrl(w.photos[0].storage_path), width: w.photos[0].width, height: w.photos[0].height } : null,
  }));
  const all = totals.data ?? [];
  const published = all.filter((w) => w.published).length;
  const filtered = Boolean(term || status || category || cycle || untitled);

  return (
    <>
      <h1 className={styles.title}>Творби</h1>
      <p className={styles.lead}>
        {all.length} творби: {published} публикувани, {all.length - published} чернови. Редът тук е редът в сайта.
      </p>
      {first(search.deleted) && (
        <p className={styles.ok} role="status">
          Творбата е изтрита.
        </p>
      )}

      <form className={styles.toolbar} role="search">
        <label className={styles.field}>
          <span className={styles.legend}>Търсене</span>
          <input name="q" defaultValue={q} placeholder="заглавие, адрес, техника" />
        </label>
        <label className={styles.field}>
          <span className={styles.legend}>Състояние</span>
          <select name="status" defaultValue={status}>
            <option value="">всички</option>
            <option value="published">публикувани</option>
            <option value="draft">чернови</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.legend}>Категория</span>
          <select name="category" defaultValue={category}>
            <option value="">всички</option>
            <option value="none">без категория</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.legend}>Цикъл</span>
          <select name="cycle" defaultValue={cycle}>
            <option value="">всички</option>
            <option value="none">без цикъл</option>
            {(cycles.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.check}>
          <input type="checkbox" name="untitled" value="1" defaultChecked={untitled} /> без заглавие
        </label>
        <button className={styles.button}>Покажи</button>
        {filtered && (
          <Link href="/admin" className={styles.buttonQuiet}>
            Изчисти
          </Link>
        )}
      </form>

      {works.data.length === 1000 && (
        <p className={styles.notice}>Показани са първите 1000. Стеснете с търсене или филтър.</p>
      )}

      <ArtworkList
        key={listed.map((w) => w.id).join()}
        works={listed}
        filtered={filtered}
        categories={(categories.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
        cycles={(cycles.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
