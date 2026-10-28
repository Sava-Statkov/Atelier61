"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

const LINKS = [
  { href: "/admin", label: "Творби" },
  { href: "/admin/artworks/new", label: "Нова творба" },
  { href: "/admin/import", label: "Масов импорт" },
  { href: "/admin/taxonomy", label: "Категории и цикли" },
  { href: "/admin/files", label: "Файлове" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Админ">
      <ul className={styles.nav}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          <a href="/" target="_blank" rel="noreferrer">
            Към сайта ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}
