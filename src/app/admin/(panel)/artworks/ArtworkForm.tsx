"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slug";
import { saveArtwork } from "../../actions";
import styles from "../../admin.module.css";

export type EditableWork = {
  id: string;
  title: string | null;
  slug: string;
  category_id: string | null;
  cycle_id: string | null;
  year: number | null;
  technique: string | null;
  description: string | null;
  height_cm: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  sources: string[];
  note: string | null;
  published: boolean;
  on_home: boolean;
  featured: boolean;
};

type Option = { id: string; label: string };

/**
 * Everything about a work except its photographs. Unknown fields stay empty; nothing has to be
 * filled in to save, so a work can wait as a draft until its facts are known.
 */
export function ArtworkForm({
  work,
  categories,
  cycles,
  sources,
  hasPhotos,
}: {
  work: EditableWork | null;
  categories: Option[];
  cycles: Option[];
  sources: Option[];
  hasPhotos: boolean;
}) {
  const [state, action, pending] = useActionState(saveArtwork, null);
  const [title, setTitle] = useState(work?.title ?? "");
  const [slug, setSlug] = useState(work?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(work));
  const [cycleId, setCycleId] = useState(work?.cycle_id ?? "");

  return (
    <form action={action} className={styles.form}>
      {work && <input type="hidden" name="id" value={work.id} />}

      <label className={styles.field}>
        <span>Заглавие</span>
        <input
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
        />
        <span className={styles.hint}>Само ако е известно. Празно поле не се показва в сайта.</span>
      </label>

      <label className={styles.field}>
        <span>Адрес в сайта</span>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder={work ? undefined : "от заглавието, или tvorba-… без заглавие"}
          required={Boolean(work)}
        />
        <span className={styles.hint}>
          /tvorbi/{slug || "…"}. Малки латински букви, цифри и тирета.{" "}
          {title && (
            <button type="button" className={`${styles.buttonQuiet} ${styles.small}`} onClick={() => setSlug(slugify(title))}>
              От заглавието
            </button>
          )}{" "}
          {work?.published && "Творбата е публикувана: смяната на адреса чупи вече споделени връзки."}
        </span>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Категория</span>
          <select name="category_id" defaultValue={work?.category_id ?? ""}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Цикъл</span>
          <select name="cycle_id" value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
            <option value="">—</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Година</span>
          <input name="year" inputMode="numeric" defaultValue={work?.year ?? ""} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Техника</span>
        <input name="technique" defaultValue={work?.technique ?? ""} placeholder="напр. масло върху платно" />
        <span className={styles.hint}>Точно както я посочва художникът.</span>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Височина, см</span>
          <input name="height_cm" inputMode="decimal" defaultValue={work?.height_cm ?? ""} />
        </label>
        <label className={styles.field}>
          <span>Ширина, см</span>
          <input name="width_cm" inputMode="decimal" defaultValue={work?.width_cm ?? ""} />
        </label>
        <label className={styles.field}>
          <span>Дълбочина, см</span>
          <input name="depth_cm" inputMode="decimal" defaultValue={work?.depth_cm ?? ""} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Описание</span>
        <textarea name="description" defaultValue={work?.description ?? ""} />
        <span className={styles.hint}>Показва се на страницата на творбата. Празен ред започва нов абзац.</span>
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Източници</legend>
        <span className={styles.hint}>Публикации, на които се основават данните (от src/content/sources.ts). Цитират се под творбата.</span>
        <div className={styles.sources}>
          {sources.map((s) => (
            <label key={s.id} className={styles.check}>
              <input type="checkbox" name="sources" value={s.id} defaultChecked={work?.sources.includes(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span>Вътрешна бележка</span>
        <textarea name="note" defaultValue={work?.note ?? ""} rows={3} />
        <span className={styles.hint}>Само за админа: какво предстои да се провери. Не се показва в сайта.</span>
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>В сайта</legend>
        <label className={styles.check}>
          <input type="checkbox" name="published" defaultChecked={work?.published} /> Публикувана
        </label>
        {!hasPhotos && <span className={styles.hint}>Без снимка творбата се показва като празно платно с надпис „Снимката на творбата предстои“.</span>}
        <label className={styles.check}>
          <input type="checkbox" name="featured" defaultChecked={work?.featured} disabled={!cycleId} /> Представителна творба за цикъла
        </label>
        <span className={styles.hint}>Показва се голяма най-отгоре, когато в „Творби“ е избран цикълът. По една на цикъл.</span>
        <label className={styles.check}>
          <input type="checkbox" name="on_home" defaultChecked={work?.on_home} /> На началната страница, до името
        </label>
        <span className={styles.hint}>Само една творба; изборът сменя предишната.</span>
      </fieldset>

      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className={styles.ok} role="status">
          {state.message}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.button} disabled={pending}>
          {pending ? "Записва се…" : work ? "Запази" : "Създай творбата"}
        </button>
      </div>
    </form>
  );
}
