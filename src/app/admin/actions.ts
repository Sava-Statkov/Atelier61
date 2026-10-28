"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { sources } from "@/content/sources";
import { requireAdmin } from "@/lib/admin/auth";
import { ARTWORKS_TAG } from "@/lib/artworks/queries";
import { SLUG_PATTERN, slugify, untitledSlug } from "@/lib/slug";
import { ARTWORKS_BUCKET } from "@/lib/supabase/env";
import { getSessionClient } from "@/lib/supabase/server";

/**
 * Everything the admin changes goes through these Server Actions. Each one checks the admin first
 * (requireAdmin), then writes with the admin's own session, so row level security applies as well.
 * Afterwards the public pages are refreshed: the next visitor sees the change, without a rebuild.
 */

export type ActionState = { ok?: boolean; message?: string; error?: string; email?: string } | null;

function refreshSite() {
  revalidateTag(ARTWORKS_TAG, { expire: 0 });
  revalidatePath("/admin", "layout");
}

type DbError = { code?: string; message: string; details?: string | null };

/** Database errors in words the admin can act on. */
function explain(error: DbError): string {
  const text = `${error.message} ${error.details ?? ""}`;
  if (error.code === "23505" && text.includes("slug")) return "Този адрес (slug) вече се използва. Изберете друг.";
  if (error.code === "23505" && text.includes("source_hash")) return "Тази снимка вече е в архива.";
  if (error.code === "23503") return "Не може да се изтрие: към него има творби. Първо ги преместете.";
  if (error.code === "23514") return "Някоя стойност е извън допустимото (напр. година между 1900 и 2100, размер над 0).";
  if (error.code === "42501") return "Нямате права за това действие.";
  return `Грешка в базата: ${error.message}`;
}

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const number = (form: FormData, name: string) => {
  const value = field(form, name);
  if (value === null) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

// ---------------------------------------------------------------------------------------------
// Signing in and out
// ---------------------------------------------------------------------------------------------

export async function signIn(_: ActionState, form: FormData): Promise<ActionState> {
  const email = field(form, "email");
  const password = form.get("password");
  if (!email || typeof password !== "string" || !password) return { error: "Въведете имейл и парола.", email: email ?? "" };

  const db = await getSessionClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: "Грешен имейл или парола.", email };

  const { data } = await db.auth.getClaims();
  if (data?.claims.app_metadata?.role !== "admin") {
    await db.auth.signOut();
    return { error: "Този профил няма права на администратор.", email };
  }
  redirect("/admin");
}

export async function signOut() {
  const db = await getSessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------------------------
// Works
// ---------------------------------------------------------------------------------------------

const knownSources = new Set(sources.map((s) => s.id));

/** Creates a work (no id in the form) or saves an existing one. */
export async function saveArtwork(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const id = field(form, "id");
  const title = field(form, "title");
  const slug = field(form, "slug") ?? ((title && slugify(title)) || untitledSlug(crypto.randomUUID().replace(/-/g, "")));
  const year = number(form, "year");
  const height = number(form, "height_cm");
  const width = number(form, "width_cm");
  const depth = number(form, "depth_cm");
  const cycleId = field(form, "cycle_id");
  const workSources = form.getAll("sources").filter((s): s is string => typeof s === "string" && s !== "");

  if (!SLUG_PATTERN.test(slug)) return { error: "Адресът може да съдържа само малки латински букви, цифри и тирета." };
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) return { error: "Годината трябва да е цяло число между 1900 и 2100." };
  if ([height, width, depth].some((n) => n !== null && !(n > 0))) return { error: "Размерите са в сантиметри и трябва да са положителни числа." };
  if ((height === null) !== (width === null)) return { error: "Посочете и височина, и ширина (или нито едно от двете)." };
  const unknown = workSources.filter((s) => !knownSources.has(s));
  if (unknown.length) return { error: `Непознат източник: ${unknown.join(", ")}.` };

  const onHome = form.get("on_home") === "on";
  const row = {
    title,
    slug,
    category_id: field(form, "category_id"),
    cycle_id: cycleId,
    year,
    technique: field(form, "technique"),
    description: field(form, "description"),
    height_cm: height,
    width_cm: width,
    depth_cm: depth,
    sources: workSources,
    note: field(form, "note"),
    published: form.get("published") === "on",
    on_home: onHome,
  };

  // Only one work hangs on the home page wall.
  if (onHome) {
    const others = db.from("artworks").update({ on_home: false }).eq("on_home", true);
    const { error } = await (id ? others.neq("id", id) : others);
    if (error) return { error: explain(error) };
  }

  const saved = id
    ? await db.from("artworks").update(row).eq("id", id).select("id").single()
    : await db.from("artworks").insert(row).select("id").single();
  if (saved.error) return { error: explain(saved.error) };
  const workId = saved.data.id;

  // The cycle's representative work.
  const featured = form.get("featured") === "on";
  const clear = await db.from("cycles").update({ featured_artwork_id: null }).eq("featured_artwork_id", workId);
  if (clear.error) return { error: explain(clear.error) };
  if (featured && cycleId) {
    const set = await db.from("cycles").update({ featured_artwork_id: workId }).eq("id", cycleId);
    if (set.error) return { error: explain(set.error) };
  }

  refreshSite();
  if (!id) redirect(`/admin/artworks/${workId}?new=1`);
  return { ok: true, message: "Запазено." };
}

/** Deletes a work, its photographs' records and then the files themselves. */
export async function deleteArtwork(id: string): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { data: photos, error } = await db.from("artwork_images").select("storage_path").eq("artwork_id", id);
  if (error) return { error: explain(error) };
  const removed = await db.from("artworks").delete().eq("id", id);
  if (removed.error) return { error: explain(removed.error) };
  refreshSite();
  if (photos.length) {
    const files = await db.storage.from(ARTWORKS_BUCKET).remove(photos.map((p) => p.storage_path));
    if (files.error) {
      return { ok: true, error: "Творбата е изтрита, но файловете на снимките не. Изтрийте ги от „Неизползвани файлове“." };
    }
  }
  redirect("/admin?deleted=1");
}

export async function setPublished(ids: string[], published: boolean): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { error } = await db.from("artworks").update({ published }).in("id", ids);
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true };
}

/** Puts the selected works in a category and/or cycle; `null` clears it, `undefined` leaves it. */
export async function assignTerms(ids: string[], terms: { categoryId?: string | null; cycleId?: string | null }): Promise<ActionState> {
  const { db } = await requireAdmin();
  const patch: { category_id?: string | null; cycle_id?: string | null } = {};
  if (terms.categoryId !== undefined) patch.category_id = terms.categoryId;
  if (terms.cycleId !== undefined) patch.cycle_id = terms.cycleId;
  const { error } = await db.from("artworks").update(patch).in("id", ids);
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true };
}

/** The given works in this order, in the positions they already hold among all works. */
export async function reorderArtworks(ids: string[]): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { error } = await db.rpc("reorder_artworks", { p_ids: ids });
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------------------------
// Photographs (the files themselves are uploaded from the browser, see PhotoManager and Importer)
// ---------------------------------------------------------------------------------------------

/** Called after the browser has uploaded or imported photographs. */
export async function photosChanged(): Promise<void> {
  await requireAdmin();
  refreshSite();
}

export async function updatePhoto(id: string, values: { alt: string; rights: string; credit: string }): Promise<ActionState> {
  const { db } = await requireAdmin();
  if (!["artist", "licensed", "unknown"].includes(values.rights)) return { error: "Непознат вид права." };
  if (values.rights === "licensed" && !values.credit.trim()) return { error: "За снимка с разрешение посочете автора и разрешението в „Автор“." };
  const { error } = await db
    .from("artwork_images")
    .update({ alt: values.alt.trim() || null, rights: values.rights, credit: values.credit.trim() || null })
    .eq("id", id);
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true, message: "Запазено." };
}

/** Photographs of a work in this order; the first is the main view. */
export async function orderPhotos(ids: string[]): Promise<ActionState> {
  const { db } = await requireAdmin();
  const results = await Promise.all(ids.map((id, i) => db.from("artwork_images").update({ sort_order: i }).eq("id", id)));
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: explain(failed.error) };
  refreshSite();
  return { ok: true };
}

export async function deletePhoto(id: string): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("artwork_images").delete().eq("id", id).select("storage_path").single();
  if (error) return { error: explain(error) };
  refreshSite();
  const files = await db.storage.from(ARTWORKS_BUCKET).remove([data.storage_path]);
  if (files.error) return { ok: true, error: "Снимката е махната, но файлът остана. Изтрийте го от „Неизползвани файлове“." };
  return { ok: true };
}

// ---------------------------------------------------------------------------------------------
// Categories and cycles
// ---------------------------------------------------------------------------------------------

export async function saveTerm(_: ActionState, form: FormData): Promise<ActionState> {
  const { db } = await requireAdmin();
  const table = form.get("table") === "cycles" ? "cycles" : "categories";
  const id = field(form, "id");
  const name = field(form, "name");
  const slug = field(form, "slug") ?? (name ? slugify(name) : null);
  const order = number(form, "sort_order") ?? 0;
  if (!name) return { error: "Въведете име." };
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: "Адресът може да съдържа само малки латински букви, цифри и тирета." };
  if (!Number.isInteger(order)) return { error: "Редът е цяло число." };

  const row = { name, slug, sort_order: order };
  const { error } =
    table === "cycles"
      ? await (id
          ? db.from("cycles").update({ ...row, description: field(form, "description") }).eq("id", id)
          : db.from("cycles").insert({ ...row, description: field(form, "description") }))
      : await (id ? db.from("categories").update(row).eq("id", id) : db.from("categories").insert(row));
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true, message: id ? "Запазено." : "Добавено." };
}

export async function deleteTerm(table: "categories" | "cycles", id: string): Promise<ActionState> {
  const { db } = await requireAdmin();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { error: explain(error) };
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------------------------
// Files in storage that no photograph refers to (e.g. after a failed delete)
// ---------------------------------------------------------------------------------------------

export async function deleteUnusedFiles(paths: string[]): Promise<ActionState> {
  const { db } = await requireAdmin();
  // Check again right before deleting, in small groups: never remove a file that a photograph uses.
  const unused: string[] = [];
  for (let i = 0; i < paths.length; i += 100) {
    const group = paths.slice(i, i + 100);
    const { data, error } = await db.from("artwork_images").select("storage_path").in("storage_path", group);
    if (error) return { error: explain(error) };
    const used = new Set(data.map((p) => p.storage_path));
    unused.push(...group.filter((p) => !used.has(p)));
  }
  for (let i = 0; i < unused.length; i += 100) {
    const removed = await db.storage.from(ARTWORKS_BUCKET).remove(unused.slice(i, i + 100));
    if (removed.error) return { error: `Файловете не се изтриха: ${removed.error.message}` };
  }
  revalidatePath("/admin/files");
  return { ok: true, message: `Изтрити файлове: ${unused.length}.` };
}
