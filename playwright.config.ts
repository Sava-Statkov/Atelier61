import { defineConfig } from "@playwright/test";

// End-to-end tests against the production build and the LOCAL Supabase in Docker:
//   npm run db:start && npm run db:admin && npm run test:e2e
// The site's Supabase address comes from .env.local, the test admin from .env.test.local.
for (const file of [".env.local", ".env.test.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // missing file: the tests that need it say so
  }
}

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
  },
});
