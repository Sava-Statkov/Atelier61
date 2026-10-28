import type { Metadata } from "next";
import { fontVariables } from "@/styles/fonts";
import "../globals.css";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Админ", template: "%s — Админ · Atelier 61" },
  robots: { index: false, follow: false },
};

/** The admin has its own page shell: plain and practical, not the exhibition. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="bg" className={fontVariables}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
