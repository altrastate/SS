import { SubscribeForm } from "@/components/comms/SubscribeForm";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { getLatestNews, getSiteSettings, getUpcomingEvents } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { pageMetadata } from "@/lib/seo";
import { formatSchoolDateTime } from "@/lib/timezone";
import Link from "next/link";

export async function generateMetadata() {
  return pageMetadata({
    title: "School notices",
    description: "Published Kapchorwa Senior Secondary School notices. Email subscriptions require explicit confirmation.",
    path: "/parent-communications",
  });
}

export default async function ParentCommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string; error?: string }>;
}) {
  const [settings, flags, news, events] = await Promise.all([
    getSiteSettings(),
    getModuleFlags(),
    getLatestNews(6),
    getUpcomingEvents(6),
  ]);
  const params = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Notices"
        title="Parent and guardian communications"
        description={
          settings.parentCommsIntro ||
          "This is a public notice centre. It is not a student information system and does not show academic results or private records."
        }
        crumbs={[{ href: "/", label: "Home" }, { href: "/parent-communications", label: "Notices" }]}
      />
      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {params.interest ? <p className="mb-6 text-sm text-ok">Your event interest has been recorded for staff review.</p> : null}
            {params.error ? <p className="mb-6 text-sm text-danger">Please provide a name, email, and consent.</p> : null}
            <SectionHeading title="Published notices" description="Only content already approved for the public website appears here." />
            <ul className="mt-6 divide-y divide-navy/10 border border-navy/10 bg-white">
              {news.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">{item.category}</p>
                  <Link href={`/news/${item.slug}`} className="font-semibold text-navy underline">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{item.summary}</p>
                </li>
              ))}
              {events.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">Event</p>
                  <Link href={`/events/${item.slug}`} className="font-semibold text-navy underline">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{item.startAt ? formatSchoolDateTime(item.startAt) : "Date to be confirmed"}</p>
                </li>
              ))}
            </ul>
            {!news.length && !events.length ? (
              <EmptyState className="mt-6" title="No public notices yet" description="Approved news and events will appear here." />
            ) : null}
          </div>
          <aside className="border border-navy/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-navy">Email subscription</h2>
            <p className="mt-3 text-sm text-muted">
              Notices are sent only after you confirm your email. You can unsubscribe at any time. Subscriber lists are not public.
            </p>
            {flags.communications ? (
              <div className="mt-6">
                <SubscribeForm />
              </div>
            ) : (
              <div className="mt-6">
                <VerifyNotice>Notice subscriptions are not enabled yet. The college has not activated this module.</VerifyNotice>
              </div>
            )}
            <p className="mt-6 text-sm">
              <Link href="/parent-communications/unsubscribe" className="text-navy underline">
                Unsubscribe
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
