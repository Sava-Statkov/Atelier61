import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// `npm run check:refs`: checks the editorial content's references to works and cycles against the
// database named in .env.local (local or production). Kept apart from `npm test`, which needs no database.
export default defineConfig(({ mode }) => ({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.refs.ts"], env: loadEnv(mode, process.cwd(), "") },
}));
