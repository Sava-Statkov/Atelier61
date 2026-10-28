import { describe, expect, it } from "vitest";
import { SLUG_PATTERN, slugify, untitledSlug } from "./slug";

describe("slugify", () => {
  it("transliterates Bulgarian titles as the existing addresses do", () => {
    expect(slugify("Конник")).toBe("konnik");
    expect(slugify("Окото на света")).toBe("okoto-na-sveta");
    expect(slugify("Каменната книга на България")).toBe("kamennata-kniga-na-balgariya");
    expect(slugify("Исторически шаржове на прехода")).toBe("istoricheski-sharzhove-na-prehoda");
    expect(slugify("Януарски коне")).toBe("yanuarski-kone");
  });

  it("follows the official table for ц, щ, ь and ю", () => {
    expect(slugify("Танц")).toBe("tants");
    expect(slugify("Щастие")).toBe("shtastie");
    expect(slugify("Шьотка")).toBe("shyotka");
    expect(slugify("Юли")).toBe("yuli");
  });

  it("keeps Latin letters and digits, drops punctuation and quotes", () => {
    expect(slugify("„Танц“ № 3 (2024)")).toBe("tants-no-3-2024");
    expect(slugify("Mozart & Shakespeare")).toBe("mozart-shakespeare");
    expect(slugify("Café")).toBe("cafe");
    expect(slugify("  ")).toBe("");
  });

  it("stays a valid slug and shortens at a word boundary", () => {
    const long = slugify("Много дълго заглавие на творба, което продължава и продължава без край и без мярка");
    expect(long.length).toBeLessThanOrEqual(60);
    expect(long).toMatch(SLUG_PATTERN);
    expect(long.endsWith("-")).toBe(false);
  });

  it("names untitled works after their photograph", () => {
    expect(untitledSlug("3f9a2c00ff")).toBe("tvorba-3f9a2c");
  });
});
