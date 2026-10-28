"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteArtwork, type ActionState } from "../../../actions";
import styles from "../../../admin.module.css";

/** Deletes the work and its photographs for good, after the admin types its address to confirm. */
export function DeleteArtwork({ id, slug, name }: { id: string; slug: string; name: string }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section aria-labelledby="delete-title" className={styles.fieldset} style={{ marginTop: "var(--space-7)", maxWidth: "46rem" }}>
      <h2 id="delete-title" className={styles.subtitle} style={{ marginTop: 0 }}>
        Изтриване
      </h2>
      <p className={styles.hint}>
        „{name}“ и всичките ѝ снимки се изтриват окончателно, и от базата, и файловете. Ако искате само да я скриете от сайта,
        махнете отметката „Публикувана“. За потвърждение напишете адреса ѝ: <strong>{slug}</strong>
      </p>
      <div className={styles.actions}>
        <input className={styles.input} aria-label="Адрес за потвърждение" value={typed} onChange={(e) => setTyped(e.target.value)} />
        <button
          type="button"
          className={styles.buttonDanger}
          disabled={typed !== slug || pending}
          onClick={() =>
            startTransition(async () => {
              const r = await deleteArtwork(id);
              setResult(r);
              if (r?.ok) router.push("/admin?deleted=1");
            })
          }
        >
          {pending ? "Изтрива се…" : "Изтрий окончателно"}
        </button>
      </div>
      {result?.error && (
        <p className={styles.error} role="alert">
          {result.error}
        </p>
      )}
    </section>
  );
}
