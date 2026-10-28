"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./gallery.module.css";

type Option = { value: string; label: string };
export type FilterGroup = { key: string; legend: string; options: Option[] };

/**
 * Category and cycle filters. They live in the address (?kategoriya=…&cikal=…), so a filtered view
 * can be shared; the server reads them and sends the matching works. No filter means all works.
 */
export function GalleryFilters({ groups, active, allLabel }: { groups: FilterGroup[]; active: Record<string, string>; allLabel: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  // The choice shows at once; the parent remounts this component when the address has changed.
  const [selected, setSelected] = useState(active);

  const set = (key: string, value: string) => {
    const next = { ...selected, [key]: value };
    setSelected(next);
    const params = new URLSearchParams();
    for (const g of groups) if (next[g.key]) params.set(g.key, next[g.key]);
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  return (
    <div className={styles.filters} aria-busy={pending || undefined}>
      {groups
        .filter((g) => g.options.length > 0)
        .map((g) => (
          <fieldset key={g.key} className={styles.group}>
            <legend>{g.legend}</legend>
            {[{ value: "", label: allLabel }, ...g.options].map((o) => (
              <label key={o.value || "all"} className={styles.chip}>
                <input
                  type="radio"
                  name={g.key}
                  value={o.value}
                  checked={(selected[g.key] ?? "") === o.value}
                  onChange={() => set(g.key, o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </fieldset>
        ))}
    </div>
  );
}
