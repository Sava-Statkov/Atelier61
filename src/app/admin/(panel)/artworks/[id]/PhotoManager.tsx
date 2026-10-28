"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ACCEPTED_TYPES, preparePhoto, sha256 } from "@/lib/admin/image";
import { findByHash, uploadPhoto } from "@/lib/admin/upload";
import { getBrowserClient } from "@/lib/supabase/browser";
import { deletePhoto, orderPhotos, photosChanged, updatePhoto, type ActionState } from "../../../actions";
import styles from "../../../admin.module.css";

export type EditablePhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string | null;
  rights: string;
  credit: string | null;
  originalFilename: string | null;
};

type Upload = { name: string; status: string; error?: boolean; duplicateOf?: string };

const RIGHTS = [
  { value: "artist", label: "на художника / семейството" },
  { value: "licensed", label: "с писмено разрешение" },
  { value: "unknown", label: "неизвестен произход (не се показва)" },
];

/** The photographs of one work: add several at once, order them (the first is the main view), describe them. */
export function PhotoManager({ artworkId, photos }: { artworkId: string; photos: EditablePhoto[] }) {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();

  const setUpload = (i: number, patch: Partial<Upload>) => setUploads((u) => u.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  async function add(files: File[]) {
    const db = getBrowserClient();
    const start = uploads.length;
    setUploads((u) => [...u, ...files.map((f) => ({ name: f.name, status: "чака" }))]);
    setBusy(true);
    let next = photos.length;
    for (const [k, file] of files.entries()) {
      const i = start + k;
      try {
        setUpload(i, { status: "проверява се" });
        const hash = await sha256(file);
        const existing = await findByHash(db, hash);
        if (existing) {
          setUpload(i, { status: "вече е в архива", duplicateOf: existing.artworkId, error: true });
          continue;
        }
        setUpload(i, { status: "обработва се" });
        const photo = await preparePhoto(file, hash);
        setUpload(i, { status: "качва се" });
        const path = await uploadPhoto(db, photo);
        const { error } = await db.from("artwork_images").insert({
          artwork_id: artworkId,
          storage_path: path,
          width: photo.width,
          height: photo.height,
          blur_data_url: photo.blur,
          source_hash: photo.hash,
          original_filename: file.name,
          sort_order: next++,
        });
        if (error) throw new Error(error.message);
        setUpload(i, { status: `готово, ${photo.width} × ${photo.height}` });
      } catch (e) {
        setUpload(i, { status: e instanceof Error ? e.message : String(e), error: true });
      }
    }
    setBusy(false);
    await photosChanged();
    router.refresh();
  }

  const run = (action: () => Promise<ActionState>) =>
    startTransition(async () => {
      setResult(await action());
      router.refresh();
    });

  const move = (index: number, to: number) => {
    const ids = photos.map((p) => p.id);
    const [id] = ids.splice(index, 1);
    ids.splice(to, 0, id);
    run(() => orderPhotos(ids));
  };

  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className={styles.subtitle}>
        Снимки
      </h2>
      <p className={styles.hint}>
        Първата е основната. Всяка се смалява до най-много 2560 px по дългата страна и се записва като WebP; данните за място
        и апарат (EXIF) се махат. Форматът JPEG, PNG или WebP.
      </p>

      <div className={styles.actions} style={{ marginBlock: "var(--space-3)" }}>
        <label className={styles.button}>
          Добави снимки
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            hidden
            disabled={busy}
            onChange={(e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = "";
              if (files.length) void add(files);
            }}
          />
        </label>
        {busy && <span className={styles.hint}>Качва се…</span>}
      </div>

      {uploads.length > 0 && (
        <ul className={styles.files} aria-live="polite">
          {uploads.map((u, i) => (
            <li key={i} data-status={u.error ? "failed" : undefined}>
              <span>{u.name}</span>
              <span>
                {u.status}
                {u.duplicateOf && (
                  <>
                    {" "}
                    <Link href={`/admin/artworks/${u.duplicateOf}`}>към творбата</Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {result?.error && (
        <p className={styles.error} role="alert">
          {result.error}
        </p>
      )}

      {photos.length === 0 ? (
        <p className={styles.lead}>Още няма снимки.</p>
      ) : (
        <ol className={styles.photos} aria-busy={pending || undefined}>
          {photos.map((p, index) => (
            <li key={p.id} className={styles.photo}>
              <Image src={p.url} width={p.width} height={p.height} alt={p.alt ?? ""} sizes="16rem" />
              <span className={styles.hint}>
                {index === 0 ? "Основна · " : ""}
                {p.width} × {p.height}
                {p.originalFilename ? ` · ${p.originalFilename}` : ""}
              </span>
              <form
                className={styles.form}
                style={{ gap: "var(--space-2)" }}
                action={(form) =>
                  run(() =>
                    updatePhoto(p.id, {
                      alt: String(form.get("alt") ?? ""),
                      rights: String(form.get("rights") ?? "artist"),
                      credit: String(form.get("credit") ?? ""),
                    }),
                  )
                }
              >
                <label className={styles.field}>
                  <span>Какво се вижда (alt)</span>
                  <input name="alt" defaultValue={p.alt ?? ""} placeholder="описание, не оценка" />
                </label>
                <label className={styles.field}>
                  <span>Права</span>
                  <select name="rights" defaultValue={p.rights}>
                    {RIGHTS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Автор на снимката</span>
                  <input name="credit" defaultValue={p.credit ?? ""} placeholder="Снимка: …" />
                </label>
                <div className={styles.actions}>
                  <button className={`${styles.button} ${styles.small}`} disabled={pending}>
                    Запази
                  </button>
                  <button type="button" className={`${styles.buttonQuiet} ${styles.small}`} disabled={pending || index === 0} onClick={() => move(index, index - 1)}>
                    ←
                  </button>
                  <button
                    type="button"
                    className={`${styles.buttonQuiet} ${styles.small}`}
                    disabled={pending || index === photos.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    className={`${styles.buttonDanger} ${styles.small}`}
                    disabled={pending}
                    onClick={() => confirm("Да се изтрие ли тази снимка? Файлът се изтрива окончателно.") && run(() => deletePhoto(p.id))}
                  >
                    Изтрий
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
