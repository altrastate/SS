import { notFound } from "next/navigation";
import { EventInterestForm } from "@/components/comms/EventInterestForm";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { getEventBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";
import { formatSchoolDateTime } from "@/lib/timezone";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return pageMetadata({
      title: "Event not found",
      description: "This event is not available.",
      path: `/events/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: event.title,
    description: event.summary,
    path: `/events/${event.slug}`,
    image: event.coverImageUrl,
  });
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ interest?: string; error?: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const status = await searchParams;

  return (
    <>
      <PageHero
        eyebrow={event.cancelled ? "Cancelled event" : event.category}
        title={event.title}
        description={event.summary}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/events", label: "Events" },
          { href: `/events/${event.slug}`, label: event.title },
        ]}
      />
      <article className="py-16">
        <div className="container-narrow">
          {event.cancelled ? (
            <p className="mb-6 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="status">
              This event has been cancelled.
            </p>
          ) : null}
          <p className="text-sm text-muted">
            {event.startAt ? formatSchoolDateTime(event.startAt) : "Date to be confirmed"}
            {event.endAt ? ` – ${formatSchoolDateTime(event.endAt)}` : ""}
          </p>
          {event.location ? <p className="mt-2 text-muted">{event.location}</p> : null}
          {event.infoUrl ? (
            <p className="mt-4">
              <a href={event.infoUrl} className="font-semibold text-navy underline">
                Further information
              </a>
            </p>
          ) : null}
          <div className="mt-8">
            <NewsArticleBody html={renderMarkdown(event.body)} />
          </div>
          {!event.cancelled ? (
            <section className="mt-10 border border-navy/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">Register interest</h2>
              <p className="mt-2 text-sm text-muted">This records your interest for school staff. It is not ticket sales or a student record.</p>
              {status.interest ? <p className="mt-3 text-sm text-ok">Your interest has been recorded.</p> : null}
              {status.error ? <p className="mt-3 text-sm text-danger">Please provide a name, email, and consent.</p> : null}
              <EventInterestForm eventId={event.id} title={event.title} from={`/events/${event.slug}`} />
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
