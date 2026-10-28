/**
 * Masonry placement for the works page: equal columns, each work in the column that is currently
 * the shortest, so the columns end at about the same height. Heights are measured in column widths
 * (a work as wide as the column and twice as tall counts 2), so the result does not depend on the
 * screen and the server and the browser place every work identically.
 *
 * Placement only ever appends: works already placed keep their column when more are loaded.
 */

/** Room for the label under a work, in column widths (default). */
export const LABEL_HEIGHT = 0.28;

/**
 * The label is about the same height in pixels at every width, so in narrow columns it takes up a
 * larger share of a column width. Measured on the works page; the measured column heights correct
 * the estimate anyway once works are on screen.
 */
export function labelHeightFor(columnCount: number): number {
  return columnCount <= 2 ? 0.5 : columnCount === 3 ? 0.36 : LABEL_HEIGHT;
}

/** Column counts of the works page and the widths (rem) from which they apply. Mirrors gallery.module.css. */
export const COLUMN_STEPS = [
  { columns: 2, minWidthRem: 0 },
  { columns: 3, minWidthRem: 40 },
  { columns: 4, minWidthRem: 60 },
] as const;

export type ColumnCount = (typeof COLUMN_STEPS)[number]["columns"];

export type Layout = {
  /** Indexes into the list of works, per column, top to bottom. */
  columns: number[][];
  /** Height of each column so far, in column widths. */
  heights: number[];
};

export function emptyLayout(columnCount: number): Layout {
  return { columns: Array.from({ length: columnCount }, () => []), heights: Array(columnCount).fill(0) };
}

/**
 * Adds works to a layout. `ratios` holds width / height for every work in the list, including the
 * ones already placed; only the works from `layout`'s current length onwards are placed.
 * Ties go to the leftmost column, so the first row reads left to right.
 */
export function place(layout: Layout, ratios: number[], labelHeight = LABEL_HEIGHT): Layout {
  const columns = layout.columns.map((c) => [...c]);
  const heights = [...layout.heights];
  const start = placedCount(layout);
  for (let i = start; i < ratios.length; i++) {
    let shortest = 0;
    for (let c = 1; c < heights.length; c++) if (heights[c] < heights[shortest] - 1e-9) shortest = c;
    columns[shortest].push(i);
    heights[shortest] += 1 / safeRatio(ratios[i]) + labelHeight;
  }
  return { columns, heights };
}

/** A fresh layout of all `ratios` over `columnCount` columns. */
export function distribute(ratios: number[], columnCount: number, labelHeight = LABEL_HEIGHT): Layout {
  return place(emptyLayout(columnCount), ratios, labelHeight);
}

/** How many works a layout holds. */
export function placedCount(layout: Layout): number {
  return layout.columns.reduce((n, c) => n + c.length, 0);
}

/**
 * Replaces the estimated column heights with measured ones (in pixels, any unit works as long as
 * it is the same for all columns), so the next works go where there really is room.
 * `columnWidth` converts the measurement into column widths.
 */
export function withMeasuredHeights(layout: Layout, measured: number[], columnWidth: number): Layout {
  if (measured.length !== layout.heights.length || !(columnWidth > 0)) return layout;
  return { columns: layout.columns, heights: measured.map((h) => h / columnWidth) };
}

/** The column count for a viewport width in rem. */
export function columnsForWidth(widthRem: number): ColumnCount {
  let result: ColumnCount = COLUMN_STEPS[0].columns;
  for (const step of COLUMN_STEPS) if (widthRem >= step.minWidthRem) result = step.columns;
  return result;
}

function safeRatio(ratio: number): number {
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}
