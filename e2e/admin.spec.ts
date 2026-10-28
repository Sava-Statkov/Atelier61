import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { localDatabase, testPicture } from "./local";

/**
 * The admin from sign-in to delete, against the production build and the local Supabase:
 * sign in, create a work, upload a photograph, publish it, see it in the gallery, hide it, import a
 * batch with a duplicate and a refused format, delete. Everything it creates is removed at the end.
 */

const { admin: db, visitor, url } = localDatabase();
const stamp = Date.now().toString(36);
const title = `Проба ${stamp}`;
const slug = `proba-${stamp}`;
const hashes: string[] = [];
const asFile = (path: string, name = basename(path)) => ({ name, mimeType: "image/jpeg", buffer: readFileSync(path) });

test.describe.configure({ mode: "serial" });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  // Remove everything the run created, records and files.
  const { data } = await db.from("artwork_images").select("artwork_id, storage_path").in("source_hash", hashes);
  const { data: byslug } = await db.from("artworks").select("id").eq("slug", slug);
  const ids = [...new Set([...(data ?? []).map((p) => p.artwork_id), ...(byslug ?? []).map((w) => w.id)])];
  if (data?.length) await db.storage.from("artworks").remove(data.map((p) => p.storage_path));
  if (ids.length) await db.from("artworks").delete().in("id", ids);
  await db.from("categories").delete().like("slug", "e2e-%");
  await page.close();
});

test("visitors without a session are sent to the sign-in page", async ({ browser }) => {
  const anonymous = await browser.newPage();
  await anonymous.goto("/admin");
  await expect(anonymous).toHaveURL(/\/admin\/login$/);
  await anonymous.goto("/admin/import");
  await expect(anonymous).toHaveURL(/\/admin\/login$/);
  await anonymous.close();
});

test("a wrong password is refused", async () => {
  await page.goto("/admin/login");
  await page.getByLabel("Имейл").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Парола").fill("not-the-password");
  await page.getByRole("button", { name: "Влез" }).click();
  await expect(page.locator("p[role=alert]")).toHaveText("Грешен имейл или парола.");
});

test("the admin signs in", async () => {
  test.skip(!process.env.E2E_ADMIN_PASSWORD, "run `npm run db:admin` first");
  await page.getByLabel("Парола").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Влез" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "Творби" })).toBeVisible();
});

test("a new work is created as a draft", async () => {
  await page.goto("/admin/artworks/new");
  await page.locator("input[name=title]").fill(title);
  await page.locator("input[name=slug]").fill(slug);
  await page.locator("select[name=category_id]").selectOption({ label: "Акварел" });
  await page.locator("select[name=cycle_id]").selectOption({ label: "Танц" });
  await page.locator("input[name=year]").fill("1999");
  await page.locator("input[name=technique]").fill("тест: акварел върху хартия");
  await page.getByRole("button", { name: "Създай творбата" }).click();
  await expect(page).toHaveURL(/\/admin\/artworks\/[0-9a-f-]+\?new=1$/);
  await expect(page.getByRole("status")).toContainText("чернова");

  const { data } = await visitor.from("artworks").select("id").eq("slug", slug);
  expect(data, "drafts are invisible to visitors").toHaveLength(0);
  expect((await page.request.get(`/tvorbi/${slug}`)).status()).toBe(404);
});

test("a photograph is uploaded: the file is in storage, its size in the database", async () => {
  const picture = await testPicture(`${stamp}-main.jpg`, 3600, 2400, 200);
  hashes.push(picture.hash);
  await page.locator("label", { hasText: "Добави снимки" }).locator("input[type=file]").setInputFiles(picture.path);
  // 3600 × 2400 is reduced to 2560 on the long side, keeping the proportion 3:2.
  await expect(page.getByText("готово, 2560 × 1707")).toBeVisible({ timeout: 60_000 });

  const { data: row } = await db.from("artwork_images").select("storage_path, width, height, blur_data_url, original_filename").eq("source_hash", picture.hash).single();
  expect(row).toMatchObject({ storage_path: `${picture.hash}.webp`, width: 2560, height: 1707, original_filename: `${stamp}-main.jpg` });
  expect(row!.blur_data_url).toMatch(/^data:image\/webp;base64,/);

  const file = await page.request.get(`${url}/storage/v1/object/public/artworks/${row!.storage_path}`);
  expect(file.status()).toBe(200);
  expect(file.headers()["content-type"]).toBe("image/webp");
  expect(file.headers()["cache-control"]).toContain("max-age=31536000");
});

test("published, the work appears on the site without a rebuild", async () => {
  await page.locator("input[name=published]").check();
  await page.getByRole("button", { name: "Запази" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Запазено." })).toBeVisible();

  await page.goto(`/tvorbi/${slug}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const image = page.locator("main img").first();
  await expect(image).toBeVisible();
  const box = await image.boundingBox();
  expect(Math.abs(box!.width / box!.height - 2560 / 1707)).toBeLessThan(0.01);

  // In the gallery, filtered by its category and cycle.
  await page.goto("/tvorbi?kategoriya=akvarel&cikal=tanc");
  await expect(page.locator(`a[href="/tvorbi/${slug}"]`).first()).toBeVisible();
});

test("moved to the top in the admin, it is first in the gallery", async () => {
  await page.goto("/admin");
  const row = page.locator("li", { has: page.locator(`a:text-is("${title}")`) });
  await row.getByTitle("Най-отпред").click();
  await expect(page.locator("ol li").first()).toContainText(title);

  await page.goto("/tvorbi");
  await expect(page.locator("[role=listitem] a").first()).toHaveAttribute("href", `/tvorbi/${slug}`);
});

test("hidden again, it disappears from the site", async () => {
  await page.goto(`/admin?q=${encodeURIComponent(stamp)}`);
  await page.locator("li", { hasText: title }).getByRole("button", { name: "Скрий" }).click();
  await expect(page.locator("li", { hasText: title }).getByText("чернова")).toBeVisible();
  expect((await page.request.get(`/tvorbi/${slug}`)).status()).toBe(404);
  await page.goto("/tvorbi");
  await expect(page.locator(`a[href="/tvorbi/${slug}"]`)).toHaveCount(0);
});

test("bulk import: new photographs become drafts, a duplicate and a refused format are reported", async () => {
  const one = await testPicture(`${stamp}-one.jpg`, 1200, 1600, 30);
  const two = await testPicture(`${stamp}-two.jpg`, 1600, 900, 120);
  hashes.push(one.hash, two.hash);
  await page.goto("/admin/import");
  await page.locator("label", { hasText: "Избери снимки" }).locator("input[type=file]").setInputFiles([
    asFile(one.path),
    asFile(two.path),
    // the photograph uploaded above, under another name
    asFile(`test-results/fixtures/${stamp}-main.jpg`, `${stamp}-again.jpg`),
    // an iPhone format the browser cannot open
    { name: `${stamp}.heic`, mimeType: "image/heic", buffer: Buffer.from("not really a picture") },
  ]);
  await expect(page.getByRole("heading", { name: "Импортът приключи" })).toBeVisible({ timeout: 90_000 });
  const tally = page.getByRole("status");
  await expect(tally).toContainText("4 от 4");
  await expect(tally).toContainText("готови: 2");
  await expect(tally).toContainText("вече в архива: 1");
  await expect(tally).toContainText("грешки: 1");
  await expect(page.locator("li", { hasText: `${stamp}.heic` })).toContainText("не се поддържа");

  // Retrying sends only the failed file again; it fails again for the same reason.
  await page.getByRole("button", { name: /Опитай отново неуспешните/ }).click();
  await expect(page.getByRole("heading", { name: "Импортът приключи" })).toBeVisible({ timeout: 30_000 });
  await expect(tally).toContainText("готови: 2");

  const { data } = await db.from("artwork_images").select("width, height, artworks(published, title)").in("source_hash", [one.hash, two.hash]);
  expect(data).toHaveLength(2);
  for (const photo of data!) expect(photo.artworks).toMatchObject({ published: false, title: null });
  expect(data!.map((p) => `${p.width}×${p.height}`).sort()).toEqual(["1200×1600", "1600×900"]);

  // Importing the same files again adds nothing.
  await page.locator("label", { hasText: "Избери снимки" }).locator("input[type=file]").setInputFiles([one.path, two.path]);
  await expect(tally).toContainText("6 от 6", { timeout: 60_000 });
  await expect(tally).toContainText("вече в архива: 3");
});

test("categories are added and removed", async () => {
  await page.goto("/admin/taxonomy");
  const form = page.locator("form").filter({ has: page.locator("input[name=table][value=categories]") }).last();
  await form.getByLabel("Име").fill("E2E категория");
  await form.getByLabel("Адрес").fill(`e2e-${stamp}`);
  await form.getByRole("button", { name: "Добави" }).click();
  const added = page.locator("form", { has: page.locator(`input[name=slug][value="e2e-${stamp}"]`) });
  await expect(added).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await added.getByRole("button", { name: "Изтрий" }).click();
  await expect(added).toHaveCount(0);
});

test("deleting a work removes its record and its photograph's file", async () => {
  const { data: row } = await db.from("artwork_images").select("storage_path").eq("source_hash", hashes[0]).single();
  await page.goto(`/admin?q=${encodeURIComponent(stamp)}`);
  await page.getByRole("link", { name: title }).click();
  await page.getByLabel("Адрес за потвърждение").fill(slug);
  await page.getByRole("button", { name: "Изтрий окончателно" }).click();
  await expect(page).toHaveURL(/\/admin\?deleted=1$/);

  const { data } = await db.from("artworks").select("id").eq("slug", slug);
  expect(data).toHaveLength(0);
  const file = await page.request.get(`${url}/storage/v1/object/public/artworks/${row!.storage_path}`);
  expect(file.status()).toBeGreaterThanOrEqual(400);
});
