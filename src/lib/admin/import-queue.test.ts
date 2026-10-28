import { describe, expect, it } from "vitest";
import { createQueue, tally, type QueueItem } from "./import-queue";

const settle = () => new Promise((r) => setTimeout(r, 0));

describe("import queue", () => {
  it("works on at most `concurrency` files at once and finishes them all", async () => {
    let active = 0;
    let peak = 0;
    const finished: number[] = [];
    let last: QueueItem<number>[] = [];
    const queue = createQueue<number>({
      concurrency: 3,
      onChange: (items) => (last = items),
      work: async (n) => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 5 + (n % 3)));
        active--;
        finished.push(n);
        return { status: "done", artworkId: `w${n}` };
      },
    });
    queue.add(Array.from({ length: 20 }, (_, i) => i));
    while (queue.busy()) await new Promise((r) => setTimeout(r, 5));
    expect(peak).toBe(3);
    expect(finished).toHaveLength(20);
    expect(tally(last).done).toBe(20);
    expect(last.every((i) => i.artworkId === `w${i.input}`)).toBe(true);
  });

  it("marks duplicates and failures, and retries only the failed ones", async () => {
    const attempts = new Map<string, number>();
    let last: QueueItem<string>[] = [];
    const queue = createQueue<string>({
      concurrency: 2,
      onChange: (items) => (last = items),
      work: async (name, report) => {
        report("обработва се");
        attempts.set(name, (attempts.get(name) ?? 0) + 1);
        if (name === "same.jpg") return { status: "duplicate", artworkId: "old", message: "вече е качена" };
        if (name === "flaky.jpg" && attempts.get(name) === 1) throw new Error("мрежова грешка");
        return { status: "done", artworkId: name };
      },
    });
    queue.add(["a.jpg", "same.jpg", "flaky.jpg"]);
    while (queue.busy()) await settle();
    expect(tally(last)).toMatchObject({ done: 1, duplicate: 1, failed: 1 });
    expect(last.find((i) => i.input === "flaky.jpg")?.message).toBe("мрежова грешка");

    queue.retryFailed();
    while (queue.busy()) await settle();
    expect(tally(last)).toMatchObject({ done: 2, duplicate: 1, failed: 0 });
    expect(attempts.get("a.jpg")).toBe(1);
    expect(attempts.get("flaky.jpg")).toBe(2);
  });

  it("accepts more files while it is running", async () => {
    let last: QueueItem<number>[] = [];
    const queue = createQueue<number>({
      concurrency: 1,
      onChange: (items) => (last = items),
      work: async () => {
        await settle();
        return { status: "done" };
      },
    });
    queue.add([1, 2]);
    queue.add([3]);
    while (queue.busy()) await settle();
    expect(last.map((i) => i.status)).toEqual(["done", "done", "done"]);
  });
});
