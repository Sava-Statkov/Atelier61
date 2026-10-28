/**
 * Placement for the irregular hang on the works page. Rows hold at most three works and some
 * hold two; widths, gaps and vertical drops differ from row to row, so the wall reads as hung by
 * hand rather than as a grid. The pattern depends only on a work's position in the (filtered)
 * list, so the server and the browser place every work identically.
 */

import type { CSSProperties } from "react";

type Slot = {
  /** First grid column (1-based). */
  col: number;
  span: number;
  /** Extra space above the work, in rem. */
  drop: number;
  /** Where a narrow (portrait) work sits inside its slot. */
  align: "start" | "center" | "end";
};

// 12 columns. Within a row the columns rise; the next row starts further left, which makes the
// grid's auto-placement begin a new row.
const DESKTOP: Slot[][] = [
  [
    { col: 1, span: 4, drop: 0, align: "start" },
    { col: 6, span: 3, drop: 7, align: "center" },
    { col: 10, span: 3, drop: 2, align: "end" },
  ],
  [
    { col: 1, span: 6, drop: 3, align: "start" },
    { col: 8, span: 4, drop: 0, align: "end" },
  ],
  [
    { col: 2, span: 3, drop: 0, align: "start" },
    { col: 6, span: 4, drop: 5, align: "center" },
    { col: 10, span: 3, drop: 1, align: "end" },
  ],
  [
    { col: 1, span: 4, drop: 6, align: "end" },
    { col: 7, span: 6, drop: 0, align: "start" },
  ],
  [
    { col: 1, span: 3, drop: 2, align: "start" },
    { col: 5, span: 4, drop: 0, align: "center" },
    { col: 10, span: 3, drop: 8, align: "end" },
  ],
];

// 6 columns: two works per row, now and then one alone.
const TABLET: Slot[][] = [
  [
    { col: 1, span: 3, drop: 0, align: "start" },
    { col: 4, span: 3, drop: 5, align: "end" },
  ],
  [{ col: 2, span: 4, drop: 0, align: "center" }],
  [
    { col: 1, span: 4, drop: 2, align: "start" },
    { col: 5, span: 2, drop: 0, align: "end" },
  ],
  [
    { col: 1, span: 2, drop: 4, align: "start" },
    { col: 3, span: 4, drop: 0, align: "end" },
  ],
];

// One column: alternating widths and sides.
const PHONE = [
  { width: "100%", align: "start" },
  { width: "82%", align: "end" },
  { width: "90%", align: "start" },
  { width: "76%", align: "end" },
] as const;

function slotAt(rows: Slot[][], index: number): Slot {
  const perCycle = rows.reduce((n, r) => n + r.length, 0);
  let i = index % perCycle;
  for (const row of rows) {
    if (i < row.length) return row[i];
    i -= row.length;
  }
  return rows[0][0];
}

/** CSS custom properties for the work at `index`, read by `.wall > li` in explorer.module.css. */
export function hangStyle(index: number, ratio: number): CSSProperties {
  const d = slotAt(DESKTOP, index);
  const t = slotAt(TABLET, index);
  const p = PHONE[index % PHONE.length];
  return {
    "--ratio": ratio,
    "--d-col": d.col,
    "--d-span": d.span,
    "--d-drop": `${d.drop}rem`,
    "--d-align": d.align,
    "--t-col": t.col,
    "--t-span": t.span,
    "--t-drop": `${t.drop}rem`,
    "--t-align": t.align,
    "--p-width": p.width,
    "--p-align": p.align,
  } as CSSProperties;
}
