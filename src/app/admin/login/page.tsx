"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { SCHOOL_CREST } from "@/lib/site-media";

function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(loginAction, {} as LoginState);
  const from = params.get("from") || "/admin";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      {state.error ? (
        <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-navy">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="min-h-11 w-full border border-navy/20 px-3"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 w-full border border-navy/20 px-3"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full bg-navy text-sm font-semibold text-white disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-navy/10 bg-white p-8">
        <Image
          src={SCHOOL_CREST}
          alt="Jinja College crest"
          width={72}
          height={72}
          className="mb-4 h-16 w-16 bg-transparent object-contain"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink">Jinja College</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">Staff sign in</h1>
        <p className="mt-3 text-sm text-muted">
          This area is for authorised school staff. Unpublished content is not visible on the public
          website.
        </p>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
