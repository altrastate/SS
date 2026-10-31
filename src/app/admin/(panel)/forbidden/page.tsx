import Link from "next/link";
import { AdminTitle } from "@/app/admin/_ui";
import { getAdminSession } from "@/lib/auth";
import { ROLE_LABELS, normalizeRole } from "@/lib/permissions";

export default async function ForbiddenPage() {
  const session = await getAdminSession();
  return (
    <>
      <AdminTitle
        title="Access denied"
        description="This section is limited to another administrative role. The request was blocked on the server."
      />
      <p className="max-w-xl text-muted">
        Signed in as {session?.email || "unknown"} ({ROLE_LABELS[normalizeRole(session?.role)]}). If you need access,
        ask a Super Admin to assign the appropriate role.
      </p>
      <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center bg-navy px-4 text-sm font-semibold text-white">
        Return to overview
      </Link>
    </>
  );
}
