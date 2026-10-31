"use client";

import { useActionState } from "react";
import { subscribeNotices, type SubscribeState } from "@/app/actions/communications";
import { COMMUNICATION_CATEGORIES } from "@/lib/permissions";

const initial: SubscribeState = { ok: false, message: "" };

export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribeNotices, initial);
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className={`px-4 py-3 text-sm ${state.ok ? "border border-ok/30 bg-ok/5 text-ok" : "border border-danger/30 bg-danger/5 text-danger"}`} role={state.ok ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}
      <label className="block text-sm font-semibold text-navy">
        Name (optional)
        <input name="name" className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Email
        <input name="email" type="email" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy">Notice categories</legend>
        {COMMUNICATION_CATEGORIES.map((item) => (
          <label key={item.id} className="mb-2 flex items-center gap-2 text-sm">
            <input name="categories" type="checkbox" value={item.id} defaultChecked={item.id === "general"} />
            {item.label}
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        I want to receive these notices and understand I can unsubscribe at any time. This is not a student information account.
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Submitting…" : "Subscribe"}
      </button>
    </form>
  );
}
