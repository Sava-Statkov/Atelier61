import type { Fact } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Citations } from "@/lib/citations";
import { isVisible } from "@/lib/publish";
import { Badge } from "../editor/Badge";
import { Cite } from "./Cite";
import { T } from "./T";
import styles from "./text.module.css";

/**
 * A list of individually sourced statements. Statements reported as the artist's view are
 * marked, so a reader can tell a fact from his opinion.
 */
export function Facts({ facts, locale, cites }: { facts?: Fact[]; locale: Locale; cites: Citations }) {
  const list = (facts ?? []).filter((f) => isVisible(f.verification));
  if (!list.length) return null;
  const t = getDictionary(locale);
  return (
    <ul className={styles.facts}>
      {list.map((f, i) => (
        <li key={i} data-voice={f.voice ?? "fact"}>
          {f.voice && f.voice !== "fact" && <span className={styles.voice}>{t.voice[f.voice]}. </span>}
          <T value={f.text} locale={locale} />
          <Cite ids={f.verification.sources} cites={cites} />
          <Badge verification={f.verification} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
