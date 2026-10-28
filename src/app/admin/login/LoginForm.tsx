"use client";

import { useActionState } from "react";
import { signIn } from "../actions";
import styles from "../admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className={styles.form}>
      <label className={styles.field}>
        <span>Имейл</span>
        {/* After a failed attempt the form is reset; the e-mail stays, only the password is asked again. */}
        <input name="email" type="email" autoComplete="username" required defaultValue={state?.email} key={state?.email} />
      </label>
      <label className={styles.field}>
        <span>Парола</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.button} disabled={pending}>
          {pending ? "Влизане…" : "Влез"}
        </button>
      </div>
    </form>
  );
}
