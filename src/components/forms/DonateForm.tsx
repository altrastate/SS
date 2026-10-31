"use client";

import { useActionState } from "react";
import { createDonation, type DonateState } from "@/app/actions/donations";

const initial: DonateState = { ok: false, message: "" };

export function DonateForm({
  projects,
  disabledReason,
}: {
  projects: Array<{ id: string; title: string }>;
  disabledReason?: string;
}) {
  const [state, action, pending] = useActionState(createDonation, initial);
  if (disabledReason) {
    return <p className="border border-navy/10 bg-white px-4 py-5 text-muted">{disabledReason}</p>;
  }
  return (
    <form action={action} className="space-y-4">
      {state.message ? <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{state.message}</p> : null}
      <label className="block text-sm font-semibold text-navy" htmlFor="donor-name">Name</label>
      <input id="donor-name" name="name" required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="donor-email">Email (for a receipt after confirmed payment)</label>
      <input id="donor-email" name="email" type="email" required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="donor-amount">Amount (UGX, whole number)</label>
      <input id="donor-amount" name="amount" type="number" min={1000} required className="min-h-11 w-full border border-navy/20 px-3" />
      <label className="block text-sm font-semibold text-navy" htmlFor="donor-project">Project (optional)</label>
      <select id="donor-project" name="projectId" className="min-h-11 w-full border border-navy/20 px-3">
        <option value="">General college support</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        I understand that success is shown only after the payment provider confirms the transaction. Do not enter card numbers or mobile-money PINs on this website.
      </label>
      <button disabled={pending} className="min-h-11 bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70" type="submit">
        {pending ? "Starting…" : "Continue to payment"}
      </button>
    </form>
  );
}
