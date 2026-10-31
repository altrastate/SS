import { redirect } from "next/navigation";
import { AdminShell } from "@/app/admin/_ui";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <AdminShell email={session.email} role={session.role}>
      {children}
    </AdminShell>
  );
}
