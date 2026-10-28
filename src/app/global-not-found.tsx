import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { fontVariables } from "@/styles/fonts";
import "./globals.css";

const t = getDictionary("bg").notFound;

export const metadata: Metadata = { title: t.title };

/** 404 for URLs that match no route at all. It bypasses the [lang] layout, so it brings its own shell. */
export default function GlobalNotFound() {
  return (
    <html lang="bg" className={fontVariables}>
      <body data-room="hall">
        <main className="page" style={{ paddingBlock: "var(--space-9)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-5)", lineHeight: "var(--leading-display)" }}>
            {t.title}
          </h1>
          <p style={{ marginTop: "var(--space-5)" }}>{t.text}</p>
          <p style={{ marginTop: "var(--space-3)" }}>
            <Link href="/">{t.home}</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
