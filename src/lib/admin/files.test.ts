import { describe, expect, it } from "vitest";
import { picturesOnly, titleFromFileName } from "./files";

describe("files for the import", () => {
  it("takes a title from a meaningful file name only", () => {
    expect(titleFromFileName("Конник.jpg")).toBe("Конник");
    expect(titleFromFileName("Окото_на_света.png")).toBe("Окото на света");
    expect(titleFromFileName("IMG_2034.jpg")).toBeNull();
    expect(titleFromFileName("DSC 0042.JPG")).toBeNull();
    expect(titleFromFileName("PXL_20240512_101112.jpg")).toBeNull();
    expect(titleFromFileName("WhatsApp Image 2024-05-01.jpeg")).toBeNull();
    expect(titleFromFileName("0012.jpg")).toBeNull();
  });

  it("keeps pictures, in natural name order", () => {
    const f = (name: string, type: string) => new File(["x"], name, { type });
    const kept = picturesOnly([f("10.jpg", "image/jpeg"), f("notes.txt", "text/plain"), f("2.jpg", "image/jpeg"), f("iphone.HEIC", ""), f(".DS_Store", "")]);
    expect(kept.map((k) => k.name)).toEqual(["2.jpg", "10.jpg", "iphone.HEIC"]);
  });
});
