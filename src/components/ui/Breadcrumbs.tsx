import Link from "next/link";
import { cn } from "@/lib/utils";

type Crumb = { href: string; label: string };

export function Breadcrumbs({
  items,
  light,
}: {
  items: Crumb[];
  light?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {last ? (
                <span className={light ? "text-ivory" : "text-navy"} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "underline-offset-4 hover:underline",
                    light ? "text-ivory/70 hover:text-ivory" : "text-muted hover:text-navy",
                  )}
                >
                  {item.label}
                </Link>
              )}
              {!last ? (
                <span aria-hidden="true" className={light ? "text-gold" : "text-gold-ink"}>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
