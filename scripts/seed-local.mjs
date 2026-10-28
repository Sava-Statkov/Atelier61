// Fills the LOCAL database with test works, to develop and test the gallery with hundreds of records.
// Every record is clearly a test ("Тестова творба 001", slug test-001) and every image is a generated
// coloured panel with "ТЕСТ" on it, never anything resembling art. Refuses to run against anything but
// the local Supabase in Docker.
//
//   npm run db:seed            400 test works (replaces earlier ones)
//   npm run db:seed -- 50      50 test works
//   npm run db:seed -- --clean remove all test works and their files
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const status = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
const url = new URL(status.API_URL);
if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
  console.error(`seed: refusing to run against ${url.hostname}; this script is for the local Supabase only.`);
  process.exit(1);
}
const db = createClient(status.API_URL, status.SECRET_KEY ?? status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const bucket = db.storage.from("artworks");

const check = ({ error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
};

async function clean() {
  const { data, error } = await db.from("artworks").select("id, photos:artwork_images(storage_path)").like("slug", "test-%");
  check({ error }, "list test works");
  const paths = data.flatMap((w) => w.photos.map((p) => p.storage_path));
  for (let i = 0; i < paths.length; i += 100) check(await bucket.remove(paths.slice(i, i + 100)), "remove files");
  check(await db.from("artworks").delete().like("slug", "test-%"), "delete test works");
  return data.length;
}

const args = process.argv.slice(2);
const removed = await clean();
if (args.includes("--clean")) {
  console.log(`seed: removed ${removed} test work(s)`);
  process.exit(0);
}
const count = Number(args.find((a) => /^\d+$/.test(a)) ?? 400);

const [{ data: categories }, { data: cycles }] = await Promise.all([
  db.from("categories").select("id").order("sort_order"),
  db.from("cycles").select("id, featured_artwork_id").order("sort_order"),
]);

// Portrait, square and landscape proportions, as photographs of paintings and drawings have.
const RATIOS = [0.75, 1, 0.8, 1.33, 0.66, 1.5, 0.7, 1.25, 0.56, 1.78];
const pad = (n) => String(n).padStart(3, "0");

async function makeImage(i) {
  const ratio = RATIOS[i % RATIOS.length];
  const width = ratio >= 1 ? 1200 : Math.round(1200 * ratio);
  const height = ratio >= 1 ? Math.round(1200 / ratio) : 1200;
  const hue = (i * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="hsl(${hue} 32% 58%)"/>
    <rect x="6%" y="6%" width="88%" height="88%" fill="none" stroke="hsl(${hue} 30% 30%)" stroke-width="6" stroke-dasharray="24 16"/>
    <text x="50%" y="48%" font-family="Arial" font-size="${Math.round(width / 6)}" font-weight="700" text-anchor="middle" fill="hsl(${hue} 30% 22%)">ТЕСТ ${pad(i + 1)}</text>
    <text x="50%" y="62%" font-family="Arial" font-size="${Math.round(width / 16)}" text-anchor="middle" fill="hsl(${hue} 30% 22%)">${width} × ${height}</text>
  </svg>`;
  const file = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
  const preview = await sharp(file).resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return {
    file,
    width,
    height,
    hash: createHash("sha256").update(file).digest("hex"),
    blur: `data:image/webp;base64,${preview.toString("base64")}`,
  };
}

const works = [];
for (let i = 0; i < count; i++) {
  const image = await makeImage(i);
  check(await bucket.upload(`${image.hash}.webp`, image.file, { contentType: "image/webp", upsert: true }), "upload");
  works.push({ i, image });
  if ((i + 1) % 50 === 0) console.log(`seed: ${i + 1}/${count} images`);
}

const rows = works.map(({ i }) => ({
  slug: `test-${pad(i + 1)}`,
  title: `Тестова творба ${pad(i + 1)}`,
  category_id: i % 6 === 5 ? null : categories[i % categories.length].id,
  cycle_id: i % 4 === 3 ? null : cycles[i % cycles.length].id,
  year: i % 3 === 0 ? null : 1985 + (i % 40),
  technique: i % 2 === 0 ? "тест: масло върху платно" : null,
  // every tenth work stays a draft, to test that drafts are hidden
  published: i % 10 !== 7,
  note: "Тестов запис — само в локалната база.",
}));
const { data: inserted, error } = await db.from("artworks").insert(rows).select("id, slug, cycle_id, published");
check({ error }, "insert works");

const bySlug = new Map(inserted.map((w) => [w.slug, w]));
const images = works.map(({ i, image }) => ({
  artwork_id: bySlug.get(`test-${pad(i + 1)}`).id,
  storage_path: `${image.hash}.webp`,
  width: image.width,
  height: image.height,
  blur_data_url: image.blur,
  source_hash: image.hash,
  original_filename: `test-${pad(i + 1)}.webp`,
  alt: `Тестово изображение ${pad(i + 1)}`,
}));
check(await db.from("artwork_images").insert(images), "insert photographs");

// A representative work for every cycle that has none, and a work on the home wall if none is set.
for (const cycle of cycles.filter((c) => !c.featured_artwork_id)) {
  const first = inserted.find((w) => w.cycle_id === cycle.id && w.published);
  if (first) check(await db.from("cycles").update({ featured_artwork_id: first.id }).eq("id", cycle.id), "set representative work");
}
const { count: onHome } = await db.from("artworks").select("id", { count: "exact", head: true }).eq("on_home", true);
if (!onHome) check(await db.from("artworks").update({ on_home: true }).eq("slug", "test-001"), "set home work");

console.log(`seed: ${inserted.length} test works (${inserted.filter((w) => !w.published).length} drafts), removed ${removed} earlier`);
