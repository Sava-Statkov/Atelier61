import type { Verification } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { showEditorNotes } from "@/lib/publish";
import styles from "./editor.module.css";

/**
 * Marks content that would be hidden on the public site. Rendered only in the working version
 * (CONTENT_MODE=all). Sourced content needs no badge: its footnote already says where it comes from.
 */
export function Badge({ verification, locale }: { verification: Verification; locale: Locale }) {
  if (!showEditorNotes || verification.status === "confirmed" || verification.status === "sourced") return null;
  const t = getDictionary(locale).verification;
  return (
    <span className={styles.badge} data-status={verification.status} title={verification.note}>
      {t[verification.status]}
    </span>
  );
}

/** A note for editors about what is missing or uncertain. */
export function EditorNote({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  if (!showEditorNotes || !children) return null;
  return (
    <aside className={styles.note}>
      <strong>{getDictionary(locale).verification.editorNote}.</strong> {children}
    </aside>
  );
}
