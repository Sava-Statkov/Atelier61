"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArtworkCard } from "@/components/art/ArtworkCard";
import type { Locale } from "@/i18n/config";
import { fetchGalleryPage, ratioOf, type GalleryPage, type GalleryQuery } from "@/lib/artworks/map";
import type { Artwork } from "@/lib/artworks/types";
import { COLUMN_STEPS, distribute, labelHeightFor, place, placedCount, withMeasuredHeights, type Layout } from "@/lib/masonry";
import { publicClient } from "@/lib/supabase/public";
import styles from "./gallery.module.css";

/** The first works are on screen before anything is scrolled: load them at once. */
const EAGER = 4;

const widthQueries = COLUMN_STEPS.filter((s) => s.minWidthRem > 0).map((s) => ({
  columns: s.columns,
  query: `(min-width: ${s.minWidthRem}rem)`,
}));

function subscribe(onChange: () => void) {
  const lists = widthQueries.map((w) => window.matchMedia(w.query));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

function currentColumns(): number {
  let columns: number = COLUMN_STEPS[0].columns;
  for (const w of widthQueries) if (window.matchMedia(w.query).matches) columns = w.columns;
  return columns;
}

/** The server does not know the screen width, so it sends a layout for every width (see render). */
const unknownColumns = () => null;

type State = {
  items: Artwork[];
  /** Cursor of the next page, null when everything is loaded. */
  next: number | null;
  /** Where the works went for the column count they were placed with. */
  placed: { columns: number; layout: Layout } | null;
  status: "idle" | "loading" | "failed";
};

/** The layout for `columns`: the one built while loading, or a fresh one (first view, new width). */
function layoutFor(state: State, columns: number): Layout {
  const { placed, items } = state;
  if (placed && placed.columns === columns && placedCount(placed.layout) === items.length) return placed.layout;
  return distribute(items.map(ratioOf), columns, labelHeightFor(columns));
}

/**
 * The works page: equal columns, each work in the shortest one (src/lib/masonry.ts), more works
 * loaded from Supabase as the visitor nears the end. Works keep their proportions, nothing is
 * cropped, and works already on screen never move when more arrive.
 */
export function Gallery({
  locale,
  initial,
  query,
  labels,
}: {
  locale: Locale;
  initial: GalleryPage;
  /** The active filters; the server already applied them to `initial`. */
  query: GalleryQuery;
  labels: { more: string; loading: string; failed: string; list: string };
}) {
  const columns = useSyncExternalStore(subscribe, currentColumns, unknownColumns);
  const [state, setState] = useState<State>({ items: initial.items, next: initial.next, placed: null, status: "idle" });
  const columnElements = useRef<(HTMLDivElement | null)[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const loadMore = useCallback(async () => {
    if (busy.current || state.next === null || columns === null) return;
    busy.current = true;
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const page = await fetchGalleryPage(publicClient, { ...query, after: state.next });
      // Real column heights, so the new works go where there really is room.
      const elements = columnElements.current.slice(0, columns);
      const measured = elements.map((el) => el?.offsetHeight ?? 0);
      const width = elements[0]?.clientWidth ?? 0;
      setState((s) => {
        const seen = new Set(s.items.map((a) => a.id));
        const items = [...s.items, ...page.items.filter((a) => !seen.has(a.id))];
        const base = withMeasuredHeights(layoutFor(s, columns), measured, width);
        const layout = place(base, items.map(ratioOf), labelHeightFor(columns));
        return { items, next: page.next, placed: { columns, layout }, status: "idle" };
      });
    } catch {
      setState((s) => ({ ...s, status: "failed" }));
    } finally {
      busy.current = false;
    }
  }, [state.next, columns, query]);

  // Load the next page when the end of the list comes within about two screens.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || state.next === null || state.status !== "idle") return;
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && void loadMore(), {
      rootMargin: "1600px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, state.next, state.status]);

  const renderLayout = (layout: Layout, count: number, live: boolean) => (
    <div className={styles.columns} role="list" aria-label={labels.list} style={{ "--columns": count } as React.CSSProperties}>
      {layout.columns.map((column, c) => (
        <div
          key={c}
          role="none"
          className={styles.column}
          ref={
            live
              ? (el) => {
                  columnElements.current[c] = el;
                }
              : undefined
          }
        >
          {column.map((i) => {
            const a = state.items[i];
            return (
              <div key={a.id} role="listitem">
                {/* The morph to the work's page needs unique names, so only the one live layout has it. */}
                <ArtworkCard artwork={a} locale={locale} size="gallery" eager={i < EAGER} morph={live} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {columns === null
        ? COLUMN_STEPS.map((step) => (
            <div key={step.columns} className={styles.layout} data-columns={step.columns}>
              {renderLayout(distribute(state.items.map(ratioOf), step.columns, labelHeightFor(step.columns)), step.columns, false)}
            </div>
          ))
        : renderLayout(layoutFor(state, columns), columns, true)}

      <div ref={sentinel} className={styles.more} aria-live="polite">
        {state.status === "loading" && <p>{labels.loading}</p>}
        {state.status === "failed" && <p>{labels.failed}</p>}
        {state.next !== null && state.status !== "loading" && (
          <button type="button" onClick={() => void loadMore()}>
            {labels.more}
          </button>
        )}
      </div>
    </>
  );
}
