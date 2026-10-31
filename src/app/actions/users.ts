"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/guard";
import { isAssignableRole, normalizeRole } from "@/lib/permissions";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createUser(formData: FormData) {
  const session = await requirePermission("users");
  const email = text(formData, "email").toLowerCase();
  const name = text(formData, "name");
  const password = text(formData, "password");
  const role = text(formData, "role");
  if (!email || !name || password.length < 8 || !isAssignableRole(role)) {
    redirect("/admin/users?error=invalid");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/admin/users?error=exists");
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      passwordHash: await hashPassword(password),
    },
  });
  await logAudit({
    session,
    action: "user.create",
    resourceType: "user",
    resourceId: user.id,
    summary: `Created ${email} as ${role}`,
  });
  redirect("/admin/users?created=1");
}

export async function updateUserRole(formData: FormData) {
  const session = await requirePermission("users");
  const id = text(formData, "id");
  const role = text(formData, "role");
  if (id === session.sub) redirect("/admin/users?error=self");
  if (!isAssignableRole(role)) redirect("/admin/users?error=invalid");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) redirect("/admin/users");
  if (normalizeRole(target.role) === "super_admin" && role !== "super_admin") {
    const remaining = await prisma.user.count({
      where: { role: { in: ["super_admin", "admin"] }, active: true, id: { not: id } },
    });
    if (remaining < 1) redirect("/admin/users?error=last-admin");
  }
  await prisma.user.update({ where: { id }, data: { role } });
  await logAudit({
    session,
    action: "user.role",
    resourceType: "user",
    resourceId: id,
    summary: `Role changed from ${target.role} to ${role}`,
  });
  redirect("/admin/users?updated=1");
}

export async function setUserActive(formData: FormData) {
  const session = await requirePermission("users");
  const id = text(formData, "id");
  if (id === session.sub) redirect("/admin/users?error=self");
  const active = text(formData, "active") === "true";
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) redirect("/admin/users");
  if (!active && normalizeRole(target.role) === "super_admin") {
    const remaining = await prisma.user.count({
      where: { role: { in: ["super_admin", "admin"] }, active: true, id: { not: id } },
    });
    if (remaining < 1) redirect("/admin/users?error=last-admin");
  }
  await prisma.user.update({ where: { id }, data: { active } });
  await logAudit({
    session,
    action: active ? "user.activate" : "user.deactivate",
    resourceType: "user",
    resourceId: id,
    summary: `${target.email} ${active ? "activated" : "deactivated"}`,
  });
  redirect("/admin/users?updated=1");
}
