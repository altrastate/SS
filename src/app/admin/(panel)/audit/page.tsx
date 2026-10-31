import { AdminTable, AdminTitle, EmptyAdmin } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("audit");
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const items = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const filtered = query
    ? items.filter((item) =>
        `${item.action} ${item.resourceType} ${item.summary || ""} ${item.actorEmail || ""}`.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  return (
    <>
      <AdminTitle
        title="Audit log"
        description="Read-only record of significant administrative actions. Passwords, tokens, and enquiry message bodies are not stored here."
      />
      <form className="mb-6 flex gap-3" method="get">
        <label className="sr-only" htmlFor="audit-search">
          Search audit log
        </label>
        <input id="audit-search" name="q" defaultValue={query} className="min-h-11 flex-1 border border-navy/20 px-3" placeholder="Action, resource, or actor" />
        <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
          Search
        </button>
      </form>
      <AdminTable headers={["When", "Actor", "Action", "Resource", "Summary"]}>
        {filtered.map((item) => (
          <tr key={item.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3">{formatSchoolDateTime(item.createdAt)}</td>
            <td className="px-4 py-3">{item.actorEmail || "System"}</td>
            <td className="px-4 py-3">{item.action}</td>
            <td className="px-4 py-3">
              {item.resourceType}
              {item.resourceId ? ` · ${item.resourceId.slice(0, 8)}` : ""}
            </td>
            <td className="px-4 py-3">{item.summary || "—"}</td>
          </tr>
        ))}
      </AdminTable>
      {!filtered.length ? <EmptyAdmin title="No audit entries" description="Publishing, deletions, enquiry status changes, and role changes will appear here." /> : null}
    </>
  );
}
