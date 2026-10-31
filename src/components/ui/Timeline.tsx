export function Timeline({
  items,
}: {
  items: Array<{
    id: string;
    year: string;
    title: string;
    description: string;
    verified: boolean;
  }>;
}) {
  return (
    <ol className="relative space-y-8 border-l border-gold/70 pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className="absolute -left-[1.7rem] top-1.5 h-3 w-3 rounded-full border border-gold bg-ivory"
            aria-hidden="true"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink">{item.year}</p>
          <h3 className="mt-1 font-serif text-2xl text-navy">{item.title}</h3>
          <p className="mt-2 text-muted">{item.description}</p>
          {!item.verified ? (
            <p className="mt-2 text-sm text-gold-ink">Wording subject to school verification.</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
