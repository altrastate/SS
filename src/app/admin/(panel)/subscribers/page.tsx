import { adminUnsubscribeSubscriber, verifySubscriber } from "@/app/actions/communications";
import { AdminTable, AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requirePermission("communications");
  const { updated } = await searchParams;
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminTitle
        title="Notice subscribers"
        description="Subscriber lists are private. Notices are sent only to verified, active addresses. Staff may confirm an address when SMTP verification is unavailable."
      />
      {updated ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Subscriber updated.</p> : null}
      <AdminTable headers={["Email", "Name", "Categories", "Status", ""]}>
        {subscribers.map((item) => (
          <tr key={item.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3">{item.email}</td>
            <td className="px-4 py-3">{item.name || "—"}</td>
            <td className="px-4 py-3 text-sm text-muted">{item.categoriesJson}</td>
            <td className="px-4 py-3">
              <StatusBadge status={item.status} />
              <p className="text-xs text-muted">Consent {formatSchoolDateTime(item.consentAt)}</p>
            </td>
            <td className="px-4 py-3 space-y-2">
              {item.status !== "active" || !item.verifiedAt ? (
                <form action={verifySubscriber}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="text-sm text-navy underline" type="submit">
                    Mark verified
                  </button>
                </form>
              ) : null}
              {item.status !== "unsubscribed" ? (
                <form action={adminUnsubscribeSubscriber}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="text-sm text-navy underline" type="submit">
                    Unsubscribe
                  </button>
                </form>
              ) : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!subscribers.length ? (
        <EmptyAdmin title="No subscribers" description="Addresses appear here after someone opts in on the notices page." />
      ) : null}
    </>
  );
}
