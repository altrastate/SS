import { AdminTable, AdminTitle, EmptyAdmin } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/utils";

export default async function AnalyticsPage() {
  await requirePermission("analytics");
  const since = daysAgo(30);
  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const pageViews = events.filter((item) => item.type === "page_view");
  const searches = events.filter((item) => item.type === "search");
  const downloads = events.filter((item) => item.type === "download");
  const forms = events.filter((item) => item.type === "form_complete");

  function tally(list: typeof events, key: "path" | "meta") {
    const counts = new Map<string, number>();
    for (const item of list) {
      const value = item[key] || "";
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }

  const popularPages = tally(pageViews, "path");
  const searchTerms = tally(searches, "meta");

  return (
    <>
      <AdminTitle
        title="Website analytics"
        description="First-party aggregates from the last 30 days. No cookies, student records, enquiry messages, or personal identifiers are stored in these counts."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Page views", pageViews.length],
          ["Search queries", searches.length],
          ["Document downloads", downloads.length],
          ["Form completions", forms.length],
        ].map(([label, value]) => (
          <article key={String(label)} className="border border-navy/10 bg-white p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-serif text-4xl text-navy">{value}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="mb-4 font-serif text-2xl text-navy">Popular public pages</h2>
          <AdminTable headers={["Path", "Views"]}>
            {popularPages.map(([path, count]) => (
              <tr key={path} className="border-t border-navy/10">
                <td className="px-4 py-3">{path}</td>
                <td className="px-4 py-3">{count}</td>
              </tr>
            ))}
          </AdminTable>
          {!popularPages.length ? <EmptyAdmin title="No page views yet" description="Counts appear after public visitors open pages." /> : null}
        </section>
        <section>
          <h2 className="mb-4 font-serif text-2xl text-navy">Search terms</h2>
          <AdminTable headers={["Term", "Count"]}>
            {searchTerms.map(([term, count]) => (
              <tr key={term} className="border-t border-navy/10">
                <td className="px-4 py-3">{term}</td>
                <td className="px-4 py-3">{count}</td>
              </tr>
            ))}
          </AdminTable>
          {!searchTerms.length ? <EmptyAdmin title="No search terms yet" description="Queries that look like emails or telephone numbers are not stored." /> : null}
        </section>
      </div>
    </>
  );
}
