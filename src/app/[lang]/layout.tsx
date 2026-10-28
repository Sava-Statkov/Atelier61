import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/content/site";
import { enabledLocales, isEnabledLocale, text } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fontVariables } from "@/styles/fonts";
import "../globals.css";

export function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) return {};
  const name = site.brandInTitle ? `${text(site.name, lang)} | ${site.brand}` : text(site.name, lang);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: { default: name, template: `%s — ${name}` },
    description: text(site.line, lang),
    robots: process.env.NEXT_PUBLIC_NOINDEX === "true" ? { index: false, follow: false } : undefined,
    openGraph: { siteName: name, locale: lang === "bg" ? "bg_BG" : "en_GB", type: "website" },
    icons: { icon: "/icon.svg" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <html lang={lang} className={fontVariables}>
      <body data-room="hall">
        <a className="skip-link" href="#content">
          {t.skipToContent}
        </a>
        <SiteHeader locale={lang} />
        <main id="content">{children}</main>
        <SiteFooter locale={lang} />
      </body>
    </html>
  );
}
