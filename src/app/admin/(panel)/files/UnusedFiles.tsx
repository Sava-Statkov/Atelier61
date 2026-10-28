"use client";

import { useState, useTransition } from "react";
import { deleteUnusedFiles, type ActionState } from "../../actions";
import styles from "../../admin.module.css";

export function UnusedFiles({ files }: { files: Array<{ name: string; size: string }> }) {
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();

  if (!files.length) return <p className={styles.ok}>Няма. Всеки файл принадлежи на снимка на творба.</p>;
  return (
    <>
      <p className={styles.hint}>Тези файлове не са снимка на нито една творба. Може да се изтрият, без да се засегне сайтът.</p>
      <ul className={styles.files} style={{ marginBlock: "var(--space-3)" }}>
        {files.map((f) => (
          <li key={f.name}>
            <span>{f.name}</span>
            <span>{f.size}</span>
          </li>
        ))}
      </ul>
      <button
        className={styles.buttonDanger}
        disabled={pending}
        onClick={() =>
          confirm(`Да се изтрият ли ${files.length} неизползвани файла?`) &&
          startTransition(async () => setResult(await deleteUnusedFiles(files.map((f) => f.name))))
        }
      >
        Изтрий неизползваните ({files.length})
      </button>
      {result?.error && <p className={styles.error}>{result.error}</p>}
      {result?.ok && <p className={styles.ok}>{result.message}</p>}
    </>
  );
}
