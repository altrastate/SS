"use client";

import { useActionState } from "react";
import { createDonation, type DonateState } from "@/app/actions/donations";

const initial: DonateState = { ok: false, message: "" };

export function DonateForm({
  projects,
}: {
  projects: Array<{ id: string; title: string }>;
}) {
  const [state, action, pending] = useActionState(createDonation, initial);
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p className="border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {state.message}
        </p>
      ) : null}
      <label className="block text-sm font-semibold text-navy">
        Name
        <input name="name" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Email
        <input name="email" type="email" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Amount (UGX, whole numbers)
        <input name="amount" type="number" min={1000} step={1} required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      {projects.length ? (
        <label className="block text-sm font-semibold text-navy">
          Project (optional)
          <select name="projectId" className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal">
            <option value="">General college development</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        I understand that a donation is only confirmed after the payment provider verifies it, and that this form does not collect card numbers or mobile-money PINs.
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Starting…" : "Continue to payment"}
      </button>
    </form>
  );
}
