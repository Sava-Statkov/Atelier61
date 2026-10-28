// Scans public/media for images and writes their dimensions, a tiny blurred preview and the
// average colour to src/content/generated/media.json. Content files then reference images by path
// only, e.g. "/media/artworks/konnik/konnik.jpg". Runs before `dev` and `build`.
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const mediaDir = join(publicDir, "media");
const out = join(root, "src", "content", "generated", "media.json");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
  );
  return files.flat();
}

let previous = {};
try {
  previous = JSON.parse(await readFile(out, "utf8"));
} catch {}

const files = (await walk(mediaDir)).filter((f) => exts.has(f.slice(f.lastIndexOf(".")).toLowerCase()));
const result = {};

for (const file of files.sort()) {
  const key = "/" + relative(publicDir, file).split("\\").join(posix.sep);
  const { mtimeMs, size } = await stat(file);
  const cached = previous[key];
  if (cached && cached.mtimeMs === mtimeMs && cached.size === size) {
    result[key] = cached;
    continue;
  }
  const image = sharp(file).rotate();
  const meta = await image.metadata();
  // EXIF orientations 5–8 are rotated by 90°, so the displayed size is swapped.
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;
  const preview = await image.clone().resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  const { dominant } = await image.clone().stats();
  const hex = (n) => n.toString(16).padStart(2, "0");
  result[key] = {
    width,
    height,
    blur: `data:image/webp;base64,${preview.toString("base64")}`,
    color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    mtimeMs,
    size,
  };
}

await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(result, null, 2) + "\n");
console.log(`media: ${Object.keys(result).length} image(s) in public/media`);
