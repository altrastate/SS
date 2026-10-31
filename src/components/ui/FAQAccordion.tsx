"use client";

type Item = { id: string; question: string; answer: string };

export function FAQAccordion({ items }: { items: Item[] }) {
  return (
    <div className="divide-y divide-navy/10 border border-navy/10 bg-white">
      {items.map((item) => (
        <details key={item.id} className="group p-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-semibold text-navy marker:content-none">
            <span>{item.question}</span>
            <span aria-hidden="true" className="text-gold-ink group-open:hidden">
              +
            </span>
            <span aria-hidden="true" className="hidden text-gold-ink group-open:inline">
              −
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
