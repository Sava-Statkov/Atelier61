import { describe, expect, it } from "vitest";
import { href, pick } from "@/i18n/config";
import { getPastExhibitions } from "./content";
import { formatDate, sortKey } from "./dates";
import { isImagePublishable, isPublishable } from "./publish";

describe("publishing rules", () => {
  it("publishes confirmed records and sourced records with a source", () => {
    expect(isPublishable({ status: "confirmed" })).toBe(true);
    expect(isPublishable({ status: "sourced", sources: ["x"] })).toBe(true);
    expect(isPublishable({ status: "sourced" })).toBe(false);
    expect(isPublishable({ status: "unconfirmed", sources: ["x"] })).toBe(false);
    expect(isPublishable({ status: "placeholder" })).toBe(false);
  });

  it("never publishes images of unknown provenance", () => {
    const src = { src: "/a.jpg", width: 4, height: 5 };
    expect(isImagePublishable({ src, alt: { bg: "" }, rights: "unknown" })).toBe(false);
    expect(isImagePublishable({ src, alt: { bg: "" }, rights: "artist" })).toBe(true);
  });
});

describe("dates", () => {
  it("formats partial dates and ranges in Bulgarian", () => {
    expect(formatDate({ year: 1961, month: 4, day: 23 }, "bg")).toBe("23 април 1961 г.");
    expect(formatDate({ year: 1991, approximate: true }, "bg")).toBe("около 1991 г.");
    expect(formatDate({ start: { year: 2007, month: 4, day: 3 }, end: { year: 2007, month: 4, day: 14 } }, "bg")).toBe("3–14 април 2007 г.");
    expect(formatDate({ start: { year: 2024, month: 10, day: 17 }, end: { year: 2024, month: 11 } }, "bg")).toBe(
      "17 октомври – ноември 2024 г.",
    );
    expect(formatDate({ start: { year: 2026, month: 1, approximate: true }, end: { year: 2026, month: 2, day: 9 } }, "bg")).toBe(
      "до 9 февруари 2026 г.",
    );
  });

  it("sorts undated entries last", () => {
    expect(sortKey(undefined)).toBeGreaterThan(sortKey({ year: 2100 }));
    expect(sortKey({ year: 2007 })).toBeLessThan(sortKey({ year: 2007, month: 4 }));
  });
});

describe("exhibitions", () => {
  it("lists what has opened by the given day, newest first", () => {
    const years = getPastExhibitions(new Date(2000, 0, 1)).map((e) => e.dates.start.year);
    expect(years).toEqual([1998, 1994, 1992]);
  });
});

describe("locales", () => {
  it("serves Bulgarian without a prefix", () => {
    expect(href("bg", "/tvorbi")).toBe("/tvorbi");
    expect(href("en", "/tvorbi")).toBe("/en/tvorbi");
    expect(href("en", "/")).toBe("/en");
  });

  it("falls back to Bulgarian and marks the fallback", () => {
    expect(pick({ bg: "Танц" }, "en")).toEqual({ value: "Танц", lang: "bg" });
    expect(pick({ bg: "Танц", en: "Dance" }, "en")).toEqual({ value: "Dance" });
    expect(pick({ bg: "Танц", en: "Dance" }, "bg")).toEqual({ value: "Танц" });
  });
});
