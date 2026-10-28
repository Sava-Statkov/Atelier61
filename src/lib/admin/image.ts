/**
 * Prepares a photograph in the admin's browser before it is uploaded, so the server never handles
 * large files and storage holds one optimised file per photograph:
 * - SHA-256 of the original file, to recognise a photograph that is already in the archive;
 * - turned upright (EXIF orientation), at most MAX_EDGE pixels on the long side, never enlarged;
 * - WebP (JPEG where the browser cannot write WebP), which also drops EXIF data such as GPS;
 * - width, height and a tiny blurred preview, read from the result.
 */

/** Long side of the stored file. Enough for close inspection on large screens; see docs/assets.md. */
export const MAX_EDGE = 2560;
const QUALITY = 0.86;
const PREVIEW_EDGE = 24;

/** Formats a browser can open. HEIC (iPhone) and TIFF have to be exported as JPEG first. */
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PreparedPhoto = {
  file: Blob;
  contentType: "image/webp" | "image/jpeg";
  extension: "webp" | "jpg";
  width: number;
  height: number;
  blur: string;
  hash: string;
};

export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fit(width: number, height: number, edge: number) {
  const scale = Math.min(1, edge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function draw(source: ImageBitmap, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Браузърът не може да обработи снимката.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** `hash` may be passed in when it was already computed for the duplicate check. */
export async function preparePhoto(original: File, hash?: string): Promise<PreparedPhoto> {
  if (!ACCEPTED_TYPES.includes(original.type)) {
    throw new Error(`Форматът ${original.type || "на файла"} не се поддържа. Запазете снимката като JPEG.`);
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(original, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Файлът не може да се отвори като снимка.");
  }
  try {
    const size = fit(bitmap.width, bitmap.height, MAX_EDGE);
    const canvas = draw(bitmap, size.width, size.height);
    let file = await toBlob(canvas, "image/webp", QUALITY);
    let contentType: PreparedPhoto["contentType"] = "image/webp";
    // Browsers that cannot write WebP silently return PNG; JPEG is the better fallback.
    if (!file || file.type !== "image/webp") {
      file = await toBlob(canvas, "image/jpeg", 0.9);
      contentType = "image/jpeg";
    }
    if (!file) throw new Error("Снимката не можа да се компресира.");

    const preview = fit(size.width, size.height, PREVIEW_EDGE);
    const blur = draw(bitmap, preview.width, preview.height).toDataURL("image/webp", 0.4);

    return {
      file,
      contentType,
      extension: contentType === "image/webp" ? "webp" : "jpg",
      width: size.width,
      height: size.height,
      blur,
      hash: hash ?? (await sha256(original)),
    };
  } finally {
    bitmap.close();
  }
}
