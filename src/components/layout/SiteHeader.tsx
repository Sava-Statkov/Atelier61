import Link from "next/link";
import { site } from "@/content/site";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { NavLinks } from "./NavLinks";
import styles from "./layout.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).nav;
  const items = [
    { href: href(locale, "/tvorbi"), label: t.works },
    { href: href(locale, "/letopis"), label: t.chronicle },
    { href: href(locale, "/izlozhbi"), label: t.exhibitions },
    { href: href(locale, "/kontakt"), label: t.contact },
  ];
  return (
    <header className={styles.header}>
      <Link href={href(locale, "/")} className={styles.wordmark}>
        {site.brand}
      </Link>
      <nav aria-label={t.label}>
        <NavLinks items={items} className={styles.nav} />
      </nav>
    </header>
  );
}
