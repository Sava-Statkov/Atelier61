"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Navigation list that marks the current section with aria-current. */
export function NavLinks({ items, className }: { items: Array<{ href: string; label: string }>; className?: string }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={current ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
