import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { can, type Permission } from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, permission)) redirect("/admin/forbidden");
  return session;
}
