import { describe, expect, it } from "vitest";
import { LABEL_HEIGHT, columnsForWidth, distribute, place, withMeasuredHeights } from "./masonry";

const flat = (columns: number[][]) => columns.flat().sort((a, b) => a - b);

describe("masonry", () => {
  it("places every work exactly once", () => {
    const ratios = Array.from({ length: 400 }, (_, i) => 0.5 + ((i * 37) % 100) / 60);
    for (const n of [2, 3, 4]) {
      const { columns } = distribute(ratios, n);
      expect(columns).toHaveLength(n);
      expect(flat(columns)).toEqual(ratios.map((_, i) => i));
    }
  });

  it("fills the first row left to right", () => {
    const { columns } = distribute([1, 1, 1, 1, 1], 4);
    expect(columns.map((c) => c[0])).toEqual([0, 1, 2, 3]);
    expect(columns[0]).toEqual([0, 4]);
  });

  it("puts the next work in the shortest column", () => {
    // A tall work in column 0, a wide one in column 1: the third goes under the wide one.
    const { columns, heights } = distribute([0.5, 2, 1], 2);
    expect(columns).toEqual([[0], [1, 2]]);
    expect(heights[0]).toBeCloseTo(2 + LABEL_HEIGHT);
    expect(heights[1]).toBeCloseTo(0.5 + 1 + 2 * LABEL_HEIGHT);
  });

  it("keeps columns balanced", () => {
    const ratios = Array.from({ length: 300 }, (_, i) => [0.6, 0.8, 1, 1.33, 1.6][i % 5]);
    const { heights } = distribute(ratios, 4);
    const tallest = Math.max(...heights);
    // No column is shorter than the tallest by more than one tall work.
    for (const h of heights) expect(tallest - h).toBeLessThan(1 / 0.6 + LABEL_HEIGHT);
  });

  it("never moves works that are already placed when more arrive", () => {
    const ratios = Array.from({ length: 72 }, (_, i) => 0.7 + (i % 7) / 5);
    const first = distribute(ratios.slice(0, 24), 3);
    const more = place(first, ratios);
    first.columns.forEach((column, c) => expect(more.columns[c].slice(0, column.length)).toEqual(column));
    expect(flat(more.columns)).toEqual(ratios.map((_, i) => i));
  });

  it("is deterministic", () => {
    const ratios = [0.8, 1.2, 0.66, 1.5, 1, 0.75, 1.33];
    expect(distribute(ratios, 3)).toEqual(distribute(ratios, 3));
  });

  it("treats a missing proportion as square", () => {
    const { heights } = distribute([0, Number.NaN], 2);
    expect(heights).toEqual([1 + LABEL_HEIGHT, 1 + LABEL_HEIGHT]);
  });

  it("continues from measured heights", () => {
    const layout = distribute([1, 1], 2);
    // Column 0 turned out taller on screen (a long title): the next work goes to column 1.
    const measured = withMeasuredHeights(layout, [500, 300], 200);
    expect(place(measured, [1, 1, 1]).columns).toEqual([[0], [1, 2]]);
  });

  it("chooses the column count from the width", () => {
    expect(columnsForWidth(23)).toBe(2);
    expect(columnsForWidth(40)).toBe(3);
    expect(columnsForWidth(59.9)).toBe(3);
    expect(columnsForWidth(60)).toBe(4);
    expect(columnsForWidth(120)).toBe(4);
  });
});
