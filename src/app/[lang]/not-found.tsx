import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./pages.module.css";

// Rendered for notFound() inside a route, e.g. an unknown artwork slug. Bulgarian until English launches.
export default function NotFound() {
  const t = getDictionary("bg").notFound;
  return (
    <div className={`page ${styles.notFound}`}>
      <h1>{t.title}</h1>
      <p>{t.text}</p>
      <p>
        <Link href="/">{t.home}</Link>
      </p>
    </div>
  );
}
