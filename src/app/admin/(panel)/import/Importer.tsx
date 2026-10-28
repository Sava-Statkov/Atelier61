"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { filesFromDrop, picturesOnly, titleFromFileName } from "@/lib/admin/files";
import { preparePhoto, sha256 } from "@/lib/admin/image";
import { createQueue, tally, type QueueItem } from "@/lib/admin/import-queue";
import { findByHash, uploadPhoto } from "@/lib/admin/upload";
import { slugify, untitledSlug } from "@/lib/slug";
import { getBrowserClient } from "@/lib/supabase/browser";
import { photosChanged } from "../../actions";
import styles from "../../admin.module.css";

type Options = { categoryId: string; cycleId: string; rights: "artist" | "licensed"; credit: string; useFileName: boolean };
type Input = { file: File; options: Options };
type Term = { id: string; name: string };

/** Files worked on at the same time: enough to keep the connection busy, few enough for a slow laptop. */
const CONCURRENCY = 3;

const STATUS: Record<QueueItem<Input>["status"], string> = {
  waiting: "чака",
  working: "работи се",
  done: "готово",
  duplicate: "вече е в архива",
  failed: "грешка",
};

/** The SQL function takes null for "none"; the generated types list its arguments as plain strings. */
const optional = (id: string) => (id || null) as string;

/** One photograph becomes one draft work. Interrupted? Import the same folder again: what is in already is skipped. */
async function importOne({ file, options }: Input, report: (step: string) => void) {
  const db = getBrowserClient();
  report("проверява се");
  const hash = await sha256(file);
  const existing = await findByHash(db, hash);
  if (existing) return { status: "duplicate" as const, artworkId: existing.artworkId };

  report("обработва се");
  const photo = await preparePhoto(file, hash);
  report("качва се");
  const path = await uploadPhoto(db, photo);

  report("записва се");
  const title = options.useFileName ? titleFromFileName(file.name) : null;
  const base = (title && slugify(title)) || untitledSlug(hash);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${hash.slice(6, 8 + attempt * 2)}`;
    const { data, error } = await db.rpc("create_artwork_with_image", {
      p_slug: slug,
      p_title: title ?? "",
      p_category_id: optional(options.categoryId),
      p_cycle_id: optional(options.cycleId),
      p_storage_path: path,
      p_width: photo.width,
      p_height: photo.height,
      p_blur_data_url: photo.blur,
      p_source_hash: hash,
      p_original_filename: file.name,
      p_rights: options.rights,
      p_credit: options.credit,
    });
    if (!error) return { status: "done" as const, artworkId: data };
    const text = `${error.message} ${error.details ?? ""}`;
    if (error.code === "23505" && text.includes("source_hash")) return { status: "duplicate" as const };
    if (!(error.code === "23505" && text.includes("slug"))) throw new Error(error.message);
  }
  throw new Error("Не се намери свободен адрес за творбата.");
}

export function Importer({ categories, cycles }: { categories: Term[]; cycles: Term[] }) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({ categoryId: "", cycleId: "", rights: "artist", credit: "", useFileName: false });
  const [items, setItems] = useState<QueueItem<Input>[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [queue] = useState(() => createQueue<Input>({ concurrency: CONCURRENCY, work: importOne, onChange: setItems }));
  const wasBusy = useRef(false);

  const counts = tally(items);
  const busy = counts.waiting + counts.working > 0;
  const finished = counts.done + counts.duplicate + counts.failed;

  // When a run ends, refresh the lists of works once.
  useEffect(() => {
    if (wasBusy.current && !busy) void photosChanged().then(() => router.refresh());
    wasBusy.current = busy;
  }, [busy, router]);

  // Closing the page stops the import; ask first.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const add = (files: File[]) => {
    const pictures = picturesOnly(files);
    if (pictures.length) queue.add(pictures.map((file) => ({ file, options })));
  };

  return (
    <>
      <fieldset className={styles.fieldset} style={{ maxWidth: "46rem" }}>
        <legend className={styles.legend}>За всички снимки от този импорт</legend>
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.legend}>Категория</span>
            <select className={styles.input} value={options.categoryId} onChange={(e) => setOptions({ ...options, categoryId: e.target.value })}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.legend}>Цикъл</span>
            <select className={styles.input} value={options.cycleId} onChange={(e) => setOptions({ ...options, cycleId: e.target.value })}>
              <option value="">—</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.legend}>Права</span>
            <select
              className={styles.input}
              value={options.rights}
              onChange={(e) => setOptions({ ...options, rights: e.target.value as Options["rights"] })}
            >
              <option value="artist">на художника / семейството</option>
              <option value="licensed">с писмено разрешение</option>
            </select>
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.legend}>Автор на снимките</span>
          <input
            className={styles.input}
            value={options.credit}
            onChange={(e) => setOptions({ ...options, credit: e.target.value })}
            placeholder="Снимка: … (ако е известен)"
          />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={options.useFileName} onChange={(e) => setOptions({ ...options, useFileName: e.target.checked })} />
          Името на файла е заглавието на творбата (напр. „Конник.jpg“; имена като IMG_2034 се пропускат)
        </label>
      </fieldset>

      <div
        className={styles.drop}
        data-active={dragOver || undefined}
        style={{ marginBlock: "var(--space-5)" }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void filesFromDrop(e.dataTransfer.items).then(add);
        }}
      >
        <p>Пуснете тук папка или снимки (JPEG, PNG, WebP)</p>
        <div className={styles.actions}>
          <label className={styles.button}>
            Избери снимки
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) => {
                add([...(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </label>
          <label className={styles.buttonQuiet}>
            Избери папка
            <input
              type="file"
              multiple
              hidden
              {...{ webkitdirectory: "" }}
              onChange={(e) => {
                add([...(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {items.length > 0 && (
        <section aria-labelledby="progress-title">
          <h2 id="progress-title" className={styles.subtitle}>
            {busy ? "Импортира се…" : "Импортът приключи"}
          </h2>
          <progress className={styles.progress} max={items.length} value={finished} aria-label="Напредък" />
          <p className={styles.tally} role="status">
            <span>
              {finished} от {items.length}
            </span>
            <span>готови: {counts.done}</span>
            <span>вече в архива: {counts.duplicate}</span>
            <span>грешки: {counts.failed}</span>
            {busy && <span>остават: {counts.waiting + counts.working}</span>}
          </p>
          {busy && <p className={styles.hint}>Не затваряйте страницата, докато импортът тече.</p>}
          <div className={styles.actions} style={{ marginBlock: "var(--space-3)" }}>
            {counts.failed > 0 && (
              <button className={styles.button} onClick={() => queue.retryFailed()}>
                Опитай отново неуспешните ({counts.failed})
              </button>
            )}
            {!busy && counts.done > 0 && (
              <Link className={styles.buttonQuiet} href="/admin?status=draft">
                Към черновите
              </Link>
            )}
          </div>
          <ul className={styles.files}>
            {items.map((i) => (
              <li key={i.id} data-status={i.status}>
                <span>{i.input.file.name}</span>
                <span>
                  {i.status === "working" ? (i.step ?? STATUS.working) : STATUS[i.status]}
                  {i.message && `: ${i.message}`}
                  {i.artworkId && (
                    <>
                      {" "}
                      <Link href={`/admin/artworks/${i.artworkId}`}>към творбата</Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
