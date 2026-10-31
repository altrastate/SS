"use client";

import { useActionState } from "react";
import { loginAlumni, registerAlumni, requestAlumniReset, resetAlumniPassword, type FormState } from "@/app/actions/alumni";

const initial: FormState = { ok: false, message: "" };

export function AlumniLoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(loginAlumni, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      {state.message ? <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{state.message}</p> : null}
      <label className="block text-sm font-semibold text-navy" htmlFor="alumni-email">Email</label>
      <input id="alumni-email" name="email" type="email" required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="alumni-password">Password</label>
      <input id="alumni-password" name="password" type="password" required className="min-h-11 w-full border border-navy/20 px-3" />
      <button disabled={pending} className="min-h-11 w-full bg-navy text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function AlumniRegisterForm() {
  const [state, action, pending] = useActionState(registerAlumni, initial);
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className={`border px-3 py-2 text-sm ${state.ok ? "border-ok/30 bg-ok/5 text-ok" : "border-danger/30 bg-danger/5 text-danger"}`}>{state.message}</p>
      ) : null}
      <label className="block text-sm font-semibold text-navy" htmlFor="reg-name">Name</label>
      <input id="reg-name" name="name" required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="reg-email">Email</label>
      <input id="reg-email" name="email" type="email" required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="reg-year">Graduation year (optional)</label>
      <input id="reg-year" name="graduationYear" className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="reg-password">Password (10+ characters)</label>
      <input id="reg-password" name="password" type="password" required minLength={10} className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        I understand this account is private by default and is not a student record.
      </label>
      <button disabled={pending} className="min-h-11 w-full bg-navy text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Submitting…" : "Create account"}
      </button>
    </form>
  );
}

export function AlumniForgotForm() {
  const [state, action, pending] = useActionState(requestAlumniReset, initial);
  return (
    <form action={action} className="space-y-4">
      {state.message ? <p className="border border-ok/30 bg-ok/5 px-3 py-2 text-sm text-ok">{state.message}</p> : null}
      <label className="block text-sm font-semibold text-navy" htmlFor="forgot-email">Email</label>
      <input id="forgot-email" name="email" type="email" required className="min-h-11 w-full border border-navy/20 px-3" />
      <button disabled={pending} className="min-h-11 w-full bg-navy text-sm font-semibold text-white disabled:opacity-70" type="submit">
        Request reset
      </button>
    </form>
  );
}

export function AlumniResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetAlumniPassword, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.message ? (
        <p className={`border px-3 py-2 text-sm ${state.ok ? "border-ok/30 bg-ok/5 text-ok" : "border-danger/30 bg-danger/5 text-danger"}`}>{state.message}</p>
      ) : null}
      <label className="block text-sm font-semibold text-navy" htmlFor="new-password">New password</label>
      <input id="new-password" name="password" type="password" required minLength={10} className="min-h-11 w-full border border-navy/20 px-3" />
      <button disabled={pending} className="min-h-11 w-full bg-navy text-sm font-semibold text-white disabled:opacity-70" type="submit">
        Update password
      </button>
    </form>
  );
}
