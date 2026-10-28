import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorNote } from "@/components/editor/Badge";
import { site } from "@/content/site";
import { isEnabledLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import pages from "../pages.module.css";
import styles from "./contact.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/kontakt">): Promise<Metadata> {
  const { lang } = await params;
  return isEnabledLocale(lang) ? { title: getDictionary(lang).contact.title } : {};
}

export default async function ContactPage({ params }: PageProps<"/[lang]/kontakt">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang).contact;
  const { email, phone, facebook } = site.contact;
  const any = email || phone || facebook;

  return (
    <div className="page">
      <header className={pages.intro}>
        <h1 className={pages.pageTitle}>{t.title}</h1>
        <p className={pages.lead}>{t.intro}</p>
      </header>
      {any ? (
        <dl className={styles.list}>
          {email && (
            <div>
              <dt>{t.email}</dt>
              <dd>
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt>{t.phone}</dt>
              <dd>
                <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
              </dd>
            </div>
          )}
          {facebook && (
            <div>
              <dt>{t.facebook}</dt>
              <dd>
                <a href={facebook} rel="noopener" target="_blank">
                  {facebook.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className={styles.pending}>{t.pending}</p>
      )}
      <EditorNote locale={lang}>
        {!any ? "Попълнете site.contact в src/content/site.ts (имейл, телефон, адрес на Facebook страницата)." : null}
      </EditorNote>
    </div>
  );
}
