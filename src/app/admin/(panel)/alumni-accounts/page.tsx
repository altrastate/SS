import { completeAlumniDeletion, disableAlumniAccount, verifyAlumniAccount } from "@/app/actions/alumni-admin";
import { AdminTable, AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function AlumniAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; deleted?: string }>;
}) {
  await requirePermission("alumni.accounts");
  const params = await searchParams;
  const accounts = await prisma.alumniAccount.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminTitle
        title="Alumni accounts"
        description="Alumni accounts are private. Staff can verify email when SMTP is unavailable, disable an account, or complete a deletion request. Password hashes are never shown."
      />
      {params.updated ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Account updated.</p> : null}
      {params.deleted ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Account deleted.</p> : null}
      <AdminTable headers={["Name", "Email", "Status", "Interests", ""]}>
        {accounts.map((account) => (
          <tr key={account.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3">
              <p className="font-semibold text-navy">{account.name}</p>
              <p className="text-xs text-muted">{account.graduationYear || "Graduation year not supplied"}</p>
            </td>
            <td className="px-4 py-3">{account.email}</td>
            <td className="px-4 py-3">
              <StatusBadge status={account.status} />
              <p className="text-xs text-muted">{formatSchoolDateTime(account.createdAt)}</p>
            </td>
            <td className="px-4 py-3 text-sm text-muted">
              {account.mentorshipInterest ? "Mentoring. " : ""}
              {account.supportInterest ? "School support." : ""}
              {!account.mentorshipInterest && !account.supportInterest ? "—" : ""}
            </td>
            <td className="px-4 py-3 space-y-2">
              {account.status === "pending_verification" ? (
                <form action={verifyAlumniAccount}>
                  <input type="hidden" name="id" value={account.id} />
                  <button className="text-sm text-navy underline" type="submit">
                    Mark email verified
                  </button>
                </form>
              ) : null}
              {account.status !== "disabled" ? (
                <form action={disableAlumniAccount}>
                  <input type="hidden" name="id" value={account.id} />
                  <button className="text-sm text-navy underline" type="submit">
                    Disable
                  </button>
                </form>
              ) : null}
              {account.status === "deletion_requested" ? (
                <form action={completeAlumniDeletion}>
                  <input type="hidden" name="id" value={account.id} />
                  <button className="text-sm text-danger underline" type="submit">
                    Complete deletion
                  </button>
                </form>
              ) : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!accounts.length ? (
        <EmptyAdmin title="No alumni accounts" description="Accounts appear here after a person registers through the alumni portal." />
      ) : null}
    </>
  );
}
