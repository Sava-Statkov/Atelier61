import styles from "./room.module.css";

/**
 * Light falling into a dark room from sources above the frame: one beam per position, never the
 * lamps. `at` places each beam (percent of the room's width); alternate beams lean left and right.
 */
export function LightRays({ at = [30, 66] }: { at?: number[] }) {
  return (
    <div className={styles.rays} aria-hidden="true">
      {at.map((x, i) => (
        <span
          key={x}
          className={styles.ray}
          style={{ "--x": `${x}%`, "--tilt": `${i % 2 ? -9 : 11}deg` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
