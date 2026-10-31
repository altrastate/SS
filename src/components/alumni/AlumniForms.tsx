"use client";

import { useActionState } from "react";
import {
  loginAlumni,
  registerAlumni,
  requestAlumniReset,
  resetAlumniPassword,
  type FormState,
} from "@/app/actions/alumni";

const initial: FormState = { ok: false, message: "" };

function Banner({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p className={`px-4 py-3 text-sm ${state.ok ? "border border-ok/30 bg-ok/5 text-ok" : "border border-danger/30 bg-danger/5 text-danger"}`} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}

export function AlumniLoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(loginAlumni, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <Banner state={state} />
      <label className="block text-sm font-semibold text-navy" htmlFor="email">
        Email
        <input id="email" name="email" type="email" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy" htmlFor="password">
        Password
        <input id="password" name="password" type="password" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function AlumniRegisterForm() {
  const [state, action, pending] = useActionState(registerAlumni, initial);
  return (
    <form action={action} className="space-y-4">
      <Banner state={state} />
      <label className="block text-sm font-semibold text-navy">
        Name
        <input name="name" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Email
        <input name="email" type="email" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Password
        <input name="password" type="password" minLength={10} required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Graduation year (optional)
        <input name="graduationYear" className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        I understand this account is private by default and is not access to student records or school administration.
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Submitting…" : "Create account"}
      </button>
    </form>
  );
}

export function AlumniForgotForm() {
  const [state, action, pending] = useActionState(requestAlumniReset, initial);
  return (
    <form action={action} className="space-y-4">
      <Banner state={state} />
      <label className="block text-sm font-semibold text-navy">
        Email
        <input name="email" type="email" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Sending…" : "Request reset"}
      </button>
    </form>
  );
}

export function AlumniResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetAlumniPassword, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Banner state={state} />
      <label className="block text-sm font-semibold text-navy">
        New password
        <input name="password" type="password" minLength={10} required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
