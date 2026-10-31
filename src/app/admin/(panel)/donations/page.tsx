import { markDonationManual } from "@/app/actions/donations";
import { AdminTable, AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { paymentsConfigured, paymentsStatus } from "@/lib/integrations/payments";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function DonationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  await requirePermission("donations");
  const params = await searchParams;
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: true },
    take: 200,
  });
  const status = paymentsStatus();

  return (
    <>
      <AdminTitle
        title="Donations"
        description="A donation is marked successful only after a verified payment-provider callback. Staff may mark failed or cancelled records, never a successful payment."
      />
      <p className="mb-6 border border-navy/10 bg-white px-4 py-3 text-sm text-muted">
        {status.message} {paymentsConfigured() ? "" : "Online checkout remains disabled."}
      </p>
      {params.updated ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Donation updated.</p> : null}
      {params.error ? <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">That status change is not allowed.</p> : null}
      <AdminTable headers={["Donor", "Amount", "Project", "Status", "Reference", ""]}>
        {donations.map((donation) => (
          <tr key={donation.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3">
              <p className="font-semibold text-navy">{donation.donorName}</p>
              <p className="text-xs text-muted">{donation.donorEmail}</p>
            </td>
            <td className="px-4 py-3">
              {donation.amount} {donation.currency}
            </td>
            <td className="px-4 py-3">{donation.project?.title || "General development"}</td>
            <td className="px-4 py-3">
              <StatusBadge status={donation.status} />
              <p className="text-xs text-muted">{formatSchoolDateTime(donation.confirmedAt || donation.createdAt)}</p>
            </td>
            <td className="px-4 py-3 text-xs">{donation.providerRef || "—"}</td>
            <td className="px-4 py-3">
              {donation.status !== "succeeded" ? (
                <form action={markDonationManual} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={donation.id} />
                  <button className="text-sm text-navy underline" name="status" value="failed" type="submit">
                    Mark failed
                  </button>
                  <button className="text-sm text-navy underline" name="status" value="cancelled" type="submit">
                    Mark cancelled
                  </button>
                </form>
              ) : (
                <span className="text-xs text-muted">Provider confirmed</span>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!donations.length ? (
        <EmptyAdmin
          title="No donation records"
          description="Records appear only after a supporter starts a payment request. Success requires provider confirmation."
        />
      ) : null}
    </>
  );
}
