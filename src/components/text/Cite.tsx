import type { Citations } from "@/lib/citations";
import styles from "./text.module.css";

/** Footnote numbers pointing to the page's source list. */
export function Cite({ ids, cites }: { ids?: string[]; cites: Citations }) {
  const numbers = (ids ?? []).map((id) => [id, cites.number(id)] as const).filter(([, n]) => n !== undefined);
  if (!numbers.length) return null;
  return (
    <sup className={styles.cite}>
      {numbers.map(([id, n], i) => (
        <span key={id}>
          {i > 0 && ","}
          <a href={`#source-${id}`} aria-label={`${cites.label} ${n}`}>
            {n}
          </a>
        </span>
      ))}
    </sup>
  );
}
