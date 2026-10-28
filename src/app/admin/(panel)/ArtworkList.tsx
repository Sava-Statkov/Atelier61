"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { assignTerms, reorderArtworks, setPublished, type ActionState } from "../actions";
import styles from "../admin.module.css";

export type ListedWork = {
  id: string;
  slug: string;
  title: string | null;
  year: number | null;
  technique: string | null;
  published: boolean;
  onHome: boolean;
  featured: boolean;
  category: string | null;
  cycle: string | null;
  thumb: { url: string; width: number; height: number } | null;
};

type Term = { id: string; name: string };

/** Keep / clear / set a category or cycle for the selected works. */
const KEEP = "__keep";
const CLEAR = "__clear";

/**
 * The works as a list: select several for publishing, hiding or a category / cycle; drag a row (or
 * use the arrows) to change the order. The order is saved at once and is the order of the site.
 */
export function ArtworkList({ works, filtered, categories, cycles }: { works: ListedWork[]; filtered: boolean; categories: Term[]; cycles: Term[] }) {
  const [order, setOrder] = useState(() => works.map((w) => w.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [category, setCategory] = useState(KEEP);
  const [cycle, setCycle] = useState(KEEP);
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();

  const byId = new Map(works.map((w) => [w.id, w]));
  const rows = order.map((id) => byId.get(id)).filter((w): w is ListedWork => Boolean(w));

  const run = (action: () => Promise<ActionState>, after?: () => void) =>
    startTransition(async () => {
      const r = await action();
      setResult(r);
      if (!r?.error) after?.();
    });

  const saveOrder = (next: string[]) => {
    const previous = order;
    setOrder(next);
    startTransition(async () => {
      const r = await reorderArtworks(next);
      if (r?.error) {
        setOrder(previous);
        setResult(r);
      }
    });
  };

  const move = (id: string, to: number) => {
    const next = order.filter((x) => x !== id);
    next.splice(Math.max(0, Math.min(to, next.length)), 0, id);
    saveOrder(next);
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ids = [...selected];
  const toTerm = (value: string) => (value === KEEP ? undefined : value === CLEAR ? null : value);

  return (
    <>
      <div className={styles.bulk} aria-busy={pending || undefined}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={rows.length > 0 && selected.size === rows.length}
            onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((w) => w.id)) : new Set())}
          />
          избери всички ({rows.length})
        </label>
        <span>Избрани: {selected.size}</span>
        <button className={`${styles.button} ${styles.small}`} disabled={!ids.length || pending} onClick={() => run(() => setPublished(ids, true))}>
          Публикувай
        </button>
        <button className={`${styles.buttonQuiet} ${styles.small}`} disabled={!ids.length || pending} onClick={() => run(() => setPublished(ids, false))}>
          Скрий
        </button>
        <select aria-label="Категория за избраните" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value={KEEP}>категория: без промяна</option>
          <option value={CLEAR}>без категория</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select aria-label="Цикъл за избраните" value={cycle} onChange={(e) => setCycle(e.target.value)}>
          <option value={KEEP}>цикъл: без промяна</option>
          <option value={CLEAR}>без цикъл</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className={`${styles.buttonQuiet} ${styles.small}`}
          disabled={!ids.length || pending || (category === KEEP && cycle === KEEP)}
          onClick={() =>
            run(
              () => assignTerms(ids, { categoryId: toTerm(category), cycleId: toTerm(cycle) }),
              () => {
                setCategory(KEEP);
                setCycle(KEEP);
              },
            )
          }
        >
          Задай
        </button>
        {pending && <span className={styles.hint}>Записва се…</span>}
      </div>

      {result?.error && (
        <p className={styles.error} role="alert">
          {result.error}
        </p>
      )}
      {filtered && rows.length > 1 && (
        <p className={styles.hint}>Списъкът е филтриран: преместването сменя реда само между показаните творби, а останалите не мърдат.</p>
      )}

      {rows.length === 0 ? (
        <p className={styles.lead}>Няма творби.</p>
      ) : (
        <ol className={styles.list}>
          {rows.map((w, index) => (
            <li
              key={w.id}
              className={styles.item}
              data-dragging={dragging === w.id || undefined}
              data-over={over === w.id && dragging !== w.id ? true : undefined}
              draggable
              onDragStart={(e) => {
                setDragging(w.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(w.id);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging && dragging !== w.id) move(dragging, order.filter((x) => x !== dragging).indexOf(w.id));
                setDragging(null);
                setOver(null);
              }}
            >
              <span className={styles.handle} aria-hidden="true" title="Влачете, за да преместите">
                ⠿
              </span>
              <input type="checkbox" aria-label={`Избери ${w.title ?? w.slug}`} checked={selected.has(w.id)} onChange={() => toggle(w.id)} />
              <span className={styles.thumb}>
                {w.thumb ? <Image src={w.thumb.url} width={w.thumb.width} height={w.thumb.height} alt="" sizes="72px" /> : <span className={styles.hint}>без снимка</span>}
              </span>
              <span>
                <span className={styles.itemTitle}>
                  <Link href={`/admin/artworks/${w.id}`}>{w.title ?? <span className={styles.untitled}>(без заглавие)</span>}</Link>
                </span>
                <span className={styles.itemMeta}>
                  {" "}
                  {[w.year, w.technique, w.category, w.cycle].filter(Boolean).join(" · ")}
                </span>
                <br />
                <span className={`${styles.badge} ${w.published ? styles.badgePublished : styles.badgeDraft}`}>{w.published ? "публикувана" : "чернова"}</span>
                {w.onHome && <span className={`${styles.badge} ${styles.badgeMark}`}>начало</span>}
                {w.featured && <span className={`${styles.badge} ${styles.badgeMark}`}>представителна</span>}
                <span className={styles.itemMeta}>/tvorbi/{w.slug}</span>
              </span>
              <span className={styles.itemButtons}>
                <button className={`${styles.buttonQuiet} ${styles.small}`} disabled={pending || index === 0} onClick={() => move(w.id, 0)} title="Най-отпред">
                  ⤒
                </button>
                <button className={`${styles.buttonQuiet} ${styles.small}`} disabled={pending || index === 0} onClick={() => move(w.id, index - 1)} title="Нагоре">
                  ↑
                </button>
                <button
                  className={`${styles.buttonQuiet} ${styles.small}`}
                  disabled={pending || index === rows.length - 1}
                  onClick={() => move(w.id, index + 1)}
                  title="Надолу"
                >
                  ↓
                </button>
                <button className={`${styles.buttonQuiet} ${styles.small}`} disabled={pending} onClick={() => run(() => setPublished([w.id], !w.published))}>
                  {w.published ? "Скрий" : "Публикувай"}
                </button>
                {w.published && (
                  <a className={`${styles.buttonQuiet} ${styles.small}`} href={`/tvorbi/${w.slug}`} target="_blank" rel="noreferrer">
                    В сайта ↗
                  </a>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
