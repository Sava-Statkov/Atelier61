"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { hangStyle } from "@/lib/hang";
import styles from "./explorer.module.css";

export type ExplorerItem = { slug: string; series: string[]; media: string[]; node: React.ReactNode; ratio: number };
type Option = { value: string; label: string };

/**
 * Filters the works by series and technique. Filters live in the URL (?cikal=…&tehnika=…)
 * so a filtered view can be linked to. The works themselves are rendered on the server.
 */
export function WorksExplorer({
  items,
  series,
  media,
  labels,
}: {
  items: ExplorerItem[];
  series: Option[];
  media: Option[];
  /** `count` templates contain {n}. */
  labels: { all: string; bySeries: string; byMedium: string; empty: string; reset: string; count: { one: string; many: string } };
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const activeSeries = params.get("cikal") ?? "";
  const activeMedium = params.get("tehnika") ?? "";

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  const shown = items.filter(
    (i) => (!activeSeries || i.series.includes(activeSeries)) && (!activeMedium || i.media.includes(activeMedium)),
  );

  const group = (name: string, key: string, options: Option[], active: string) =>
    options.length > 0 && (
      <fieldset className={styles.group}>
        <legend>{name}</legend>
        {[{ value: "", label: labels.all }, ...options].map((o) => (
          <label key={o.value || "all"} className={styles.chip}>
            <input type="radio" name={key} value={o.value} checked={active === o.value} onChange={() => set(key, o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
    );

  return (
    <>
      <div className={styles.filters}>
        {group(labels.bySeries, "cikal", series, activeSeries)}
        {group(labels.byMedium, "tehnika", media, activeMedium)}
      </div>
      <p className={styles.count} role="status">
        {(shown.length === 1 ? labels.count.one : labels.count.many).replace("{n}", String(shown.length))}
      </p>
      {shown.length ? (
        <ul className={styles.wall}>
          {shown.map((i, index) => (
            <li key={i.slug} style={hangStyle(index, i.ratio)}>
              {i.node}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {labels.empty}{" "}
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })}>
            {labels.reset}
          </button>
        </p>
      )}
    </>
  );
}
