import styles from "./room.module.css";

/**
 * The recessed ceiling light of reference design2, used as the threshold between rooms
 * instead of a hairline rule.
 */
export function LightSlot() {
  return <div className={styles.slot} aria-hidden="true" />;
}
