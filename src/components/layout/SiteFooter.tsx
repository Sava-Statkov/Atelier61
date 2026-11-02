import Image from "next/image";
import Link from "next/link";
import footerBackground from "@/assets/room/footer-background.png";
import { site } from "@/content/site";
import { href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LightSlot } from "../room/LightSlot";
import { T } from "../text/T";
import styles from "./layout.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <LightSlot />
      <footer className={styles.footer}>
        {/* Decorative watercolour behind the footer, so it has no alt text */}
        <Image
          src={footerBackground}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className={styles.footerImage}
          aria-hidden="true"
        />
        <div className={styles.footerInner}>
          <p className={styles.footerName}>
            <T value={site.name} locale={locale} />
          </p>
          <ul className={styles.footerNav}>
            <li>
              <Link href={href(locale, "/tvorbi")}>{t.nav.works}</Link>
            </li>
            <li>
              <Link href={href(locale, "/letopis")}>{t.nav.chronicle}</Link>
            </li>
            <li>
              <Link href={href(locale, "/izlozhbi")}>{t.nav.exhibitions}</Link>
            </li>
            <li>
              <Link href={href(locale, "/intervyu")}>{t.nav.film}</Link>
            </li>
            <li>
              <Link href={href(locale, "/kontakt")}>{t.nav.contact}</Link>
            </li>
          </ul>
          <p className={styles.footerNote}>{t.footer.note}</p>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} <T value={site.name} locale={locale} />
          </p>
        </div>
      </footer>
    </>
  );
}
