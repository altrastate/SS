"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiries";

const initial: EnquiryState = { ok: false, message: "" };

function admissionLevel(category: string) {
  if (category.startsWith("S1")) return "S1";
  if (category.startsWith("S5")) return "S5";
  return "general";
}

export function HomeEnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initial);

  return (
    <form className="home-form" action={action} noValidate>
      <input type="hidden" name="type" value="admissions" />
      <div className="hidden" aria-hidden="true">
        <label htmlFor="home-website">Website</label>
        <input id="home-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <h3>Send an enquiry</h3>
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-[var(--green-2)]" : "text-sm text-danger"} role={state.ok ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}
      <label className="sr-only" htmlFor="home-name">
        Parent / guardian name
      </label>
      <input id="home-name" name="name" required placeholder="Parent / guardian name" autoComplete="name" />
      <label className="sr-only" htmlFor="home-phone">
        Phone number
      </label>
      <input id="home-phone" name="phone" required type="tel" placeholder="Phone number" autoComplete="tel" />
      <label className="sr-only" htmlFor="home-category">
        Enquiry about
      </label>
      <select
        id="home-category"
        name="category"
        required
        defaultValue=""
        onChange={(event) => {
          const hidden = document.getElementById("home-level") as HTMLInputElement | null;
          if (hidden) hidden.value = admissionLevel(event.target.value);
        }}
      >
        <option value="">Enquiry about…</option>
        <option value="S1 admission">S.1 Admission</option>
        <option value="S5 admission">S.5 Admission</option>
        <option value="Transfer">Transfer</option>
        <option value="General enquiry">General</option>
      </select>
      <input type="hidden" id="home-level" name="admissionLevel" defaultValue="general" />
      <label className="sr-only" htmlFor="home-message">
        Your message
      </label>
      <textarea id="home-message" name="message" rows={4} required placeholder="Your message" />
      <label className="consent">
        <input name="consent" type="checkbox" required />
        <span>I understand this is a general enquiry and the school may use these details to reply.</span>
      </label>
      {state.fieldErrors?.message ? <p className="text-sm text-danger">{state.fieldErrors.message}</p> : null}
      <button className="btn btn-gold" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
