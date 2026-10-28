import Image from "next/image";
import stone from "@/assets/room/stone.png";
import styles from "./room.module.css";

/**
 * The stone band under the hall. Decorative, so it has no alt text. Eager, because on desktop it
 * sits inside the first screen.
 */
export function Stone() {
  return (
    <div className={styles.stone} aria-hidden="true">
      <Image src={stone} alt="" fill sizes="100vw" loading="eager" placeholder="blur" className={styles.stoneImage} />
    </div>
  );
}
