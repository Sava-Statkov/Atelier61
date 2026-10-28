// Creates (or resets) the admin account of the LOCAL Supabase in Docker, for development and the
// end-to-end tests. The password is generated and written to .env.test.local (not committed).
// Refuses to run against anything but the local stack: the production admin is created by hand
// in the Supabase dashboard (see docs/assets.md).
//
//   npm run db:admin
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const status = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
const url = new URL(status.API_URL);
if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
  console.error(`admin: refusing to run against ${url.hostname}; this script is for the local Supabase only.`);
  process.exit(1);
}
const db = createClient(status.API_URL, status.SECRET_KEY ?? status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = "admin@atelier61.test";
const password = randomBytes(18).toString("base64url");

const { data: list, error: listError } = await db.auth.admin.listUsers();
if (listError) throw listError;
const existing = list.users.find((u) => u.email === email);
const attributes = { password, email_confirm: true, app_metadata: { role: "admin" } };
const { error } = existing ? await db.auth.admin.updateUserById(existing.id, attributes) : await db.auth.admin.createUser({ email, ...attributes });
if (error) throw error;

writeFileSync(
  ".env.test.local",
  `# The local test admin (npm run db:admin). Local Supabase only; not committed.\nE2E_ADMIN_EMAIL=${email}\nE2E_ADMIN_PASSWORD=${password}\n`,
);
console.log(`admin: ${existing ? "reset" : "created"} ${email}; password in .env.test.local`);
