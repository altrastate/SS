"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiries";
import { cn } from "@/lib/utils";

type Props = {
  type: "contact" | "admissions";
  categories: string[];
};

const initial: EnquiryState = { ok: false, message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export function EnquiryForm({ type, categories }: Props) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="type" value={type} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${type}-website`}>Website</label>
        <input id={`${type}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message ? (
        <div
          className={cn(
            "px-4 py-3 text-sm",
            state.ok ? "border border-ok/30 bg-ok/5 text-ok" : "border border-danger/30 bg-danger/5 text-danger",
          )}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor={`${type}-name`} className="mb-1 block text-sm font-semibold text-navy">
          Full name
        </label>
        <input
          id={`${type}-name`}
          name="name"
          required
          autoComplete="name"
          className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${type}-email`} className="mb-1 block text-sm font-semibold text-navy">
            Email
          </label>
          <input
            id={`${type}-email`}
            name="email"
            type="email"
            autoComplete="email"
            className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>
        <div>
          <label htmlFor={`${type}-phone`} className="mb-1 block text-sm font-semibold text-navy">
            Telephone
          </label>
          <input
            id={`${type}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
          />
          <FieldError message={state.fieldErrors?.phone} />
        </div>
      </div>
      <p className="text-sm text-muted">Provide at least one of email or telephone so the school can reply.</p>

      {type === "admissions" ? (
        <div>
          <label htmlFor={`${type}-level`} className="mb-1 block text-sm font-semibold text-navy">
            Admission level
          </label>
          <select
            id={`${type}-level`}
            name="admissionLevel"
            required
            defaultValue=""
            className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
          >
            <option value="" disabled>
              Select a level
            </option>
            <option value="S1">Senior 1</option>
            <option value="S5">Senior 5</option>
            <option value="general">General admissions enquiry</option>
          </select>
          <FieldError message={state.fieldErrors?.admissionLevel} />
        </div>
      ) : null}

      <div>
        <label htmlFor={`${type}-category`} className="mb-1 block text-sm font-semibold text-navy">
          Enquiry category
        </label>
        <select
          id={`${type}-category`}
          name="category"
          required
          defaultValue=""
          className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.category} />
      </div>

      <div>
        <label htmlFor={`${type}-message`} className="mb-1 block text-sm font-semibold text-navy">
          Message
        </label>
        <textarea
          id={`${type}-message`}
          name="message"
          required
          rows={6}
          className="w-full border border-navy/20 bg-white px-3 py-2"
        />
        <FieldError message={state.fieldErrors?.message} />
      </div>

      <div className="flex items-start gap-3">
        <input id={`${type}-consent`} name="consent" type="checkbox" className="mt-1 h-4 w-4" required />
        <label htmlFor={`${type}-consent`} className="text-sm text-muted">
          I understand that this form is for a general enquiry and that Jinja College may use the
          details I provide to respond. I will not include private student records or sensitive
          personal information.
        </label>
      </div>
      <FieldError message={state.fieldErrors?.consent} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center bg-navy px-5 text-sm font-semibold text-white disabled:opacity-70"
      >
        {pending ? "Sending…" : type === "admissions" ? "Send admissions enquiry" : "Send enquiry"}
      </button>
    </form>
  );
}

export function ContactForm() {
  return (
    <EnquiryForm
      type="contact"
      categories={["General enquiry", "Visit request", "Alumni", "Media", "Other"]}
    />
  );
}

export function AdmissionEnquiryForm() {
  return (
    <EnquiryForm
      type="admissions"
      categories={["S1 admission", "S5 admission", "Transfer", "Fees information", "Other"]}
    />
  );
}
