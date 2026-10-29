import { execSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

// End-to-end tests against the production build and the LOCAL Supabase in Docker:
//   npm run db:start && npm run db:admin && npm run test:e2e
// The test admin comes from .env.test.local. The site under test always uses the local Supabase,
// whatever .env.local says, so the tests can never touch the production database.
try {
  process.loadEnvFile(".env.test.local");
} catch {
  // missing file: the tests that need it say so
}

const local = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
const localSupabase = { NEXT_PUBLIC_SUPABASE_URL: local.API_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.PUBLISHABLE_KEY };
Object.assign(process.env, localSupabase);

const port = 3301;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    // The Chrome installed on this machine; no browser download needed.
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    locale: "bg-BG",
  },
  webServer: {
    command: `npm run build && npx next start --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: localSupabase,
  },
});
