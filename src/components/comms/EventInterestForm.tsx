"use client";

import { expressEventInterest } from "@/app/actions/alumni";

export function EventInterestForm({
  eventId,
  title,
  from,
  defaultName,
  defaultEmail,
}: {
  eventId?: string;
  title: string;
  from: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  return (
    <form action={expressEventInterest} className="mt-4 space-y-3">
      <input type="hidden" name="eventId" value={eventId || ""} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="from" value={from} />
      <label className="block text-sm font-semibold text-navy">
        Name
        <input name="name" required defaultValue={defaultName} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Email
        <input name="email" type="email" required defaultValue={defaultEmail} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-navy">
        Message (optional)
        <textarea name="message" rows={3} className="mt-1 w-full border border-navy/20 px-3 py-2 font-normal" />
      </label>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1" />
        The college may contact me about this event. This is not a student records request.
      </label>
      <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
        Register interest
      </button>
    </form>
  );
}
