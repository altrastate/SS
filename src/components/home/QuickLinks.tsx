import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About the school", hint: "Place, leadership, and values" },
  { href: "/academics", label: "Academics", hint: "O-Level and A-Level pathways" },
  { href: "/admissions", label: "Admissions", hint: "Enquire about Senior 1 and Senior 5" },
  { href: "/campus-life", label: "Campus life", hint: "The school day, sport, and clubs" },
  { href: "/news", label: "News", hint: "Notices from the school" },
  { href: "/contact", label: "Contact", hint: "Kawowo, Kapchorwa Municipality" },
];

export function QuickLinks() {
  return (
    <nav aria-label="Quick links" className="grid gap-px bg-gold/30 sm:grid-cols-2 lg:grid-cols-3">
      {LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group bg-navy px-6 py-6 text-ivory transition-colors hover:bg-navy-soft"
        >
          <p className="font-serif text-2xl text-ivory group-hover:text-gold-soft">{item.label}</p>
          <p className="mt-2 text-sm text-ivory/70">{item.hint}</p>
        </Link>
      ))}
    </nav>
  );
}
