import Link from "next/link";

export function AnnouncementBar({
  text,
  href,
}: {
  text: string;
  href?: string | null;
}) {
  if (!text.trim()) return null;

  return (
    <div className="bg-navy-deep text-ivory">
      <div className="container-page flex items-start justify-between gap-4 py-2.5 text-sm">
        <p>
          <span className="mr-2 font-semibold uppercase tracking-[0.16em] text-gold-soft">Notice</span>
          {href ? (
            <Link href={href} className="underline hover:text-gold-soft">
              {text}
            </Link>
          ) : (
            text
          )}
        </p>
      </div>
    </div>
  );
}
