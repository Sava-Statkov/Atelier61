import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

/** The local Supabase with full rights, to check and clean up what the tests did. Local only. */
export function localDatabase() {
  const status = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  if (!["127.0.0.1", "localhost"].includes(new URL(status.API_URL).hostname)) throw new Error("The tests run against the local Supabase only.");
  return {
    url: status.API_URL as string,
    admin: createClient(status.API_URL, status.SECRET_KEY ?? status.SERVICE_ROLE_KEY, { auth: { persistSession: false } }),
    visitor: createClient(status.API_URL, status.PUBLISHABLE_KEY ?? status.ANON_KEY, { auth: { persistSession: false } }),
  };
}

const dir = join("test-results", "fixtures");

/** A generated test picture (plain colour, "E2E" on it) and the SHA-256 of the file. */
export async function testPicture(name: string, width: number, height: number, hue: number) {
  mkdirSync(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="hsl(${hue} 40% 55%)"/><text x="50%" y="55%" font-size="${Math.round(height / 5)}" font-family="Arial" text-anchor="middle" fill="#222">E2E ${name}</text></svg>`;
  const path = join(dir, name);
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
  writeFileSync(path, buffer);
  return { path, hash: createHash("sha256").update(buffer).digest("hex") };
}
