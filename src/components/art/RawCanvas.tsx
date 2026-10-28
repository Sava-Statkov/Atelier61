import styles from "./art.module.css";

/**
 * Stand-in for a missing photograph: unprimed linen (the raw canvas edge in reference design2).
 * It says what is missing and never imitates a painting.
 */
export function RawCanvas({ ratio, label }: { ratio: number; label: string }) {
  return (
    <div className={styles.rawCanvas} style={{ aspectRatio: String(ratio) }}>
      <span>{label}</span>
    </div>
  );
}
