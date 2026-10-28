"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteTerm, saveTerm, type ActionState } from "../../actions";
import styles from "../../admin.module.css";

export type Term = { id: string; name: string; slug: string; sort_order: number; description?: string | null; works: number };

/** One category or cycle as a row of fields: edit and save, or delete when no work uses it. */
export function TermForm({ table, term }: { table: "categories" | "cycles"; term?: Term }) {
  const [state, action, pending] = useActionState(saveTerm, null);
  const [deleting, startDelete] = useTransition();
  const [deleted, setDeleted] = useState<ActionState>(null);

  return (
    <form action={action} className={styles.toolbar} style={{ marginBottom: "var(--space-3)" }}>
      <input type="hidden" name="table" value={table} />
      {term && <input type="hidden" name="id" value={term.id} />}
      <label className={styles.field}>
        <span className={styles.legend}>Име</span>
        <input name="name" defaultValue={term?.name} required />
      </label>
      <label className={styles.field}>
        <span className={styles.legend}>Адрес</span>
        <input name="slug" defaultValue={term?.slug} placeholder="от името" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
      </label>
      <label className={styles.field} style={{ minWidth: "5rem", maxWidth: "6rem" }}>
        <span className={styles.legend}>Ред</span>
        <input name="sort_order" inputMode="numeric" defaultValue={term?.sort_order ?? 0} />
      </label>
      {table === "cycles" && (
        <label className={styles.field} style={{ flex: "1 1 22rem" }}>
          <span className={styles.legend}>Описание (1–2 изречения)</span>
          <input name="description" defaultValue={term?.description ?? ""} />
        </label>
      )}
      <button className={`${styles.button} ${styles.small}`} disabled={pending}>
        {term ? "Запази" : "Добави"}
      </button>
      {term && (
        <button
          type="button"
          className={`${styles.buttonDanger} ${styles.small}`}
          disabled={deleting || term.works > 0}
          title={term.works > 0 ? `Има ${term.works} творби` : undefined}
          onClick={() => confirm(`Да се изтрие ли „${term.name}“?`) && startDelete(async () => setDeleted(await deleteTerm(table, term.id)))}
        >
          Изтрий
        </button>
      )}
      {term && <span className={styles.hint}>{term.works} творби</span>}
      {(state?.error || deleted?.error) && (
        <span className={styles.error} role="alert">
          {state?.error ?? deleted?.error}
        </span>
      )}
      {state?.ok && <span className={styles.hint}>{state.message}</span>}
    </form>
  );
}
