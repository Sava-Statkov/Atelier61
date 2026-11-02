import Image from "next/image";
import stone from "@/assets/room/stone.png";
import styles from "./room.module.css";

/**
 * The vertical stone beside the hall. Decorative, so it has no alt text. Eager, because it sits
 * inside the first screen. The header moves beside it through `data-stone` (layout.module.css).
 */
export function Stone() {
  return (
    <div className={styles.stone} aria-hidden="true" data-stone>
      <Image src={stone} alt="" fill sizes="(min-width: 100rem) 15.5rem, 18vw" loading="eager" placeholder="blur" className={styles.stoneImage} />
    </div>
  );
}
