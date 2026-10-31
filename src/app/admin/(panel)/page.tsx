import Link from "next/link";
import { AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { getDashboardStats } from "@/lib/content";
import { can } from "@/lib/permissions";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function AdminHomePage() {
  const session = await requirePermission("dashboard");
  const stats = await getDashboardStats();

  const cards = [
    { href: "/admin/news", label: "Published public pages", value: stats.publishedPages, show: true },
    { href: "/admin/news", label: "Drafts awaiting review", value: stats.draftContent, show: can(session.role, "news") },
    { href: "/admin/enquiries", label: "New admissions / contact enquiries", value: stats.newEnquiries, show: can(session.role, "enquiries") },
    { href: "/admin/enquiries", label: "Enquiries awaiting response", value: stats.awaitingEnquiries, show: can(session.role, "enquiries") },
    { href: "/admin/news", label: "Published news", value: stats.publishedNews, show: can(session.role, "news") },
    { href: "/admin/projects", label: "Published projects", value: stats.publishedProjects, show: can(session.role, "projects") },
  ].filter((card) => card.show);

  const actions = [
    can(session.role, "news") ? { href: "/admin/news/new", label: "Write news" } : null,
    can(session.role, "events") ? { href: "/admin/events", label: "Add event" } : null,
    can(session.role, "enquiries") ? { href: "/admin/enquiries", label: "Review enquiries" } : null,
    can(session.role, "downloads") ? { href: "/admin/downloads", label: "Manage downloads" } : null,
    can(session.role, "media") ? { href: "/admin/media", label: "Open media library" } : null,
    can(session.role, "alumni.accounts") ? { href: "/admin/alumni-accounts", label: "Review alumni accounts" } : null,
    can(session.role, "communications") ? { href: "/admin/communications", label: "Draft a notice" } : null,
    can(session.role, "donations") ? { href: "/admin/donations", label: "Donation records" } : null,
    can(session.role, "integrations") ? { href: "/admin/integrations", label: "Integration status" } : null,
    can(session.role, "settings") ? { href: "/admin/settings", label: "Site settings" } : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <>
      <AdminTitle
        title="Overview"
        description="Live counts from this website. Draft content stays off the public pages until an authorised user publishes it."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="border border-navy/10 bg-white p-5 hover:border-gold">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-serif text-4xl text-navy">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex min-h-11 items-center border border-navy bg-navy px-4 text-sm font-semibold text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        {can(session.role, "news") ? (
          <section className="border border-navy/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-navy">Recent news</h2>
            {stats.recentNews.length ? (
              <ul className="mt-4 divide-y divide-navy/10">
                {stats.recentNews.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/admin/news/${item.id}`} className="font-semibold text-navy underline">
                      {item.title}
                    </Link>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyAdmin title="No articles yet" description="Create a draft when the school has copy ready to review." />
            )}
          </section>
        ) : null}

        {can(session.role, "events") ? (
          <section className="border border-navy/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-navy">Upcoming events</h2>
            {stats.upcomingEvents.length ? (
              <ul className="mt-4 divide-y divide-navy/10">
                {stats.upcomingEvents.map((item) => (
                  <li key={item.id} className="py-3">
                    <Link href={`/admin/events?id=${item.id}`} className="font-semibold text-navy underline">
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted">
                      {item.startAt ? formatSchoolDateTime(item.startAt) : "Date to be confirmed"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyAdmin
                title="No upcoming published events"
                description="Events appear here only after they are published with a future date."
              />
            )}
          </section>
        ) : null}
      </div>

      {can(session.role, "audit") ? (
        <section className="mt-8 border border-navy/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-navy">Recent administrative activity</h2>
            <Link href="/admin/audit" className="text-sm font-semibold text-navy underline">
              Full audit log
            </Link>
          </div>
          {stats.recentAudit.length ? (
            <ul className="mt-4 divide-y divide-navy/10 text-sm">
              {stats.recentAudit.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="font-semibold text-navy">
                    {item.action} · {item.resourceType}
                  </p>
                  <p className="text-muted">
                    {item.summary || "Change recorded"} · {item.actorEmail || "System"} · {formatSchoolDateTime(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyAdmin title="No activity recorded yet" description="Publishing, deletions, and role changes will appear here." />
          )}
        </section>
      ) : null}
    </>
  );
}
