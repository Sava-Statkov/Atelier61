/**
 * Web addresses from Bulgarian titles, by the official transliteration (Закон за транслитерацията,
 * 2009): "Окото на света" → "okoto-na-sveta", "Танц" → "tants". Existing slugs are never changed
 * automatically: an address that is published stays as it is.
 */
const BG: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht",
  ъ: "a", ь: "y", ю: "yu", я: "ya",
};

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(title: string, maxLength = 60): string {
  const latin = [...title.toLowerCase().normalize("NFC")].map((ch) => BG[ch] ?? ch).join("");
  const slug = latin
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > maxLength ? slug.slice(0, maxLength).replace(/-+[^-]*$/, "") || slug.slice(0, maxLength) : slug;
}

/** A slug for a work whose title is not known yet, from the photograph's hash: "tvorba-3f9a2c". */
export function untitledSlug(hash: string): string {
  return `tvorba-${hash.slice(0, 6)}`;
}
