// Re-prints src/lib/supabase/database.types.ts (written unformatted by `supabase gen types`) with the
// TypeScript printer, so the generated types are readable. Run by `npm run db:types`.
import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const file = new URL("../src/lib/supabase/database.types.ts", import.meta.url);
const source = ts.createSourceFile("database.types.ts", await readFile(file, "utf8"), ts.ScriptTarget.Latest, true);
const printed = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(source);
await writeFile(file, `// Generated from the local database by \`npm run db:types\`. Do not edit.\n${printed}`);
