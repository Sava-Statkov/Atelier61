import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sources } from "@/content/sources";
import { requireAdmin } from "@/lib/admin/auth";
import { photoUrl } from "@/lib/supabase/env";
import { ArtworkForm } from "../ArtworkForm";
import { DeleteArtwork } from "./DeleteArtwork";
import { PhotoManager } from "./PhotoManager";
import styles from "../../../admin.module.css";

export const metadata: Metadata = { title: "Творба" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditArtworkPage({ params, searchParams }: PageProps<"/admin/artworks/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { db } = await requireAdmin();
  const search = await searchParams;

  const [work, photos, categories, cycles] = await Promise.all([
    db.from("artworks").select("*").eq("id", id).maybeSingle(),
    db
      .from("artwork_images")
      .select("id, storage_path, width, height, alt, rights, credit, original_filename")
      .eq("artwork_id", id)
      .order("sort_order"),
    db.from("categories").select("id, name").order("sort_order"),
    db.from("cycles").select("id, name, featured_artwork_id").order("sort_order"),
  ]);
  if (work.error) throw new Error(work.error.message);
  if (!work.data) notFound();
  const w = work.data;
  const name = w.title ?? "Без заглавие";

  return (
    <>
      <p className={styles.hint}>
        <Link href="/admin">← Всички творби</Link>
        {w.published && (
          <>
            {" · "}
            <a href={`/tvorbi/${w.slug}`} target="_blank" rel="noreferrer">
              Виж в сайта ↗
            </a>
          </>
        )}
      </p>
      <h1 className={styles.title}>{name}</h1>
      {search.new && (
        <p className={styles.ok} role="status">
          Творбата е създадена като {w.published ? "публикувана" : "чернова"}. Добавете снимки по-долу.
        </p>
      )}

      <ArtworkForm
        work={{
          id: w.id,
          title: w.title,
          slug: w.slug,
          category_id: w.category_id,
          cycle_id: w.cycle_id,
          year: w.year,
          technique: w.technique,
          description: w.description,
          height_cm: w.height_cm,
          width_cm: w.width_cm,
          depth_cm: w.depth_cm,
          sources: w.sources,
          note: w.note,
          published: w.published,
          on_home: w.on_home,
          featured: (cycles.data ?? []).some((c) => c.featured_artwork_id === w.id),
        }}
        categories={(categories.data ?? []).map((c) => ({ id: c.id, label: c.name }))}
        cycles={(cycles.data ?? []).map((c) => ({ id: c.id, label: c.name }))}
        sources={sources.map((s) => ({ id: s.id, label: `${s.outlet}: ${s.title}` }))}
        hasPhotos={(photos.data ?? []).length > 0}
      />

      <PhotoManager
        artworkId={w.id}
        photos={(photos.data ?? []).map((p) => ({
          id: p.id,
          url: photoUrl(p.storage_path),
          width: p.width,
          height: p.height,
          alt: p.alt,
          rights: p.rights,
          credit: p.credit,
          originalFilename: p.original_filename,
        }))}
      />

      <DeleteArtwork id={w.id} slug={w.slug} name={name} />
    </>
  );
}
