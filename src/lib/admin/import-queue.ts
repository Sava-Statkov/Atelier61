/**
 * The queue behind the bulk import: works through files a few at a time, keeps a status per file
 * and can put the failed ones back in line. It knows nothing about images or Supabase; the import
 * page gives it the work to do per file (src/app/admin/import/Importer.tsx).
 */

export type ItemStatus = "waiting" | "working" | "done" | "duplicate" | "failed";

export type QueueItem<T> = {
  id: number;
  input: T;
  status: ItemStatus;
  /** What is happening right now, e.g. "качва се". */
  step?: string;
  /** Why it failed, or which work it duplicates. */
  message?: string;
  artworkId?: string;
};

export type Outcome = { status: "done" | "duplicate"; artworkId?: string; message?: string };

export type Work<T> = (input: T, report: (step: string) => void) => Promise<Outcome>;

export function createQueue<T>({
  concurrency,
  work,
  onChange,
}: {
  concurrency: number;
  work: Work<T>;
  onChange: (items: QueueItem<T>[]) => void;
}) {
  let items: QueueItem<T>[] = [];
  let running = 0;
  let nextId = 1;

  const update = (id: number, patch: Partial<QueueItem<T>>) => {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    onChange(items);
  };

  const pump = () => {
    while (running < concurrency) {
      const item = items.find((i) => i.status === "waiting");
      if (!item) return;
      running++;
      update(item.id, { status: "working", step: undefined, message: undefined });
      work(item.input, (step) => update(item.id, { step }))
        .then((o) => update(item.id, { status: o.status, artworkId: o.artworkId, message: o.message, step: undefined }))
        .catch((e: unknown) => update(item.id, { status: "failed", message: e instanceof Error ? e.message : String(e), step: undefined }))
        .finally(() => {
          running--;
          pump();
        });
    }
  };

  return {
    add(inputs: T[]) {
      items = [...items, ...inputs.map((input) => ({ id: nextId++, input, status: "waiting" as const }))];
      onChange(items);
      pump();
    },
    retryFailed() {
      items = items.map((i) => (i.status === "failed" ? { ...i, status: "waiting" as const, message: undefined } : i));
      onChange(items);
      pump();
    },
    /** True while anything is waiting or being worked on. */
    busy: () => running > 0 || items.some((i) => i.status === "waiting"),
  };
}

/** How many items are in each state. */
export function tally<T>(items: QueueItem<T>[]): Record<ItemStatus, number> {
  const counts = { waiting: 0, working: 0, done: 0, duplicate: 0, failed: 0 };
  for (const i of items) counts[i.status]++;
  return counts;
}
