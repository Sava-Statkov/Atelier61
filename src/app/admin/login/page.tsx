import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <main className={styles.login}>
      <h1 className={styles.title}>Вход</h1>
      <p className={styles.lead}>Админ на сайта на Румен Статков.</p>
      <LoginForm />
    </main>
  );
}
