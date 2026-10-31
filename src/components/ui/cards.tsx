import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function FeatureCard({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article className="card-lift flex h-full flex-col border border-navy/10 bg-white p-6">
      <h3 className="font-serif text-2xl text-navy">{title}</h3>
      <p className="mt-3 flex-1 text-muted">{description}</p>
      {href ? (
        <Link href={href} className="mt-5 text-sm font-semibold text-navy underline">
          {linkLabel || "Read more"}
        </Link>
      ) : null}
    </article>
  );
}

export function AcademicPathwayCard({
  name,
  levelLabel,
  summary,
}: {
  name: string;
  levelLabel: string;
  summary: string;
}) {
  return (
    <article className="border border-navy/10 bg-white p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink">{levelLabel}</p>
      <h3 className="mt-3 font-serif text-3xl text-navy">{name}</h3>
      <p className="mt-4 text-muted">{summary}</p>
    </article>
  );
}

export function NewsCard({
  href,
  title,
  summary,
  date,
  category,
  imageUrl,
  imageAlt,
}: {
  href: string;
  title: string;
  summary: string;
  date?: Date | string | null;
  category?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-navy/10 bg-white">
      {imageUrl ? (
        <div className="relative aspect-[16/9] bg-ivory-dark">
          <Image src={imageUrl} alt={imageAlt || ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : (
        <div className="h-1 bg-gold" aria-hidden="true" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">
          {category || "News"}
          {date ? ` · ${formatDate(date)}` : ""}
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug">
          <Link href={href} className="text-navy hover:underline">
            {title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-muted">{summary}</p>
      </div>
    </article>
  );
}

export function EventCard({
  title,
  summary,
  date,
  location,
  href,
}: {
  title: string;
  summary: string;
  date?: Date | string | null;
  location?: string | null;
  href?: string;
}) {
  return (
    <article className="border border-navy/10 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">
        {date ? formatDate(date) : "Date to be confirmed"}
      </p>
      <h3 className="mt-2 font-serif text-2xl text-navy">
        {href ? (
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      {location ? <p className="mt-1 text-sm text-muted">{location}</p> : null}
      <p className="mt-3 text-muted">{summary}</p>
    </article>
  );
}

export function DownloadCard({
  title,
  description,
  href,
}: {
  title: string;
  description?: string | null;
  href: string;
}) {
  return (
    <article className="flex flex-col border border-navy/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-serif text-xl text-navy">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <a
        href={href}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline sm:mt-0"
      >
        Download document
      </a>
    </article>
  );
}
