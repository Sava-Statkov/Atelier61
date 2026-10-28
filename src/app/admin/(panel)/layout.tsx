import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "../actions";
import { AdminNav } from "./AdminNav";
import styles from "../admin.module.css";

/** Every page behind the sign-in: the menu, and the admin check before anything renders. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brand}>
          Atelier 61 · админ
        </Link>
        <AdminNav />
        <form action={signOut} className={styles.actions}>
          {email && <span className={styles.who}>{email}</span>}
          <button className={`${styles.buttonQuiet} ${styles.small}`}>Изход</button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  );
}
