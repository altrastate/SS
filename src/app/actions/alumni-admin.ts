"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function verifyAlumniAccount(formData: FormData) {
  const session = await requirePermission("alumni.accounts");
  const id = String(formData.get("id") || "");
  await prisma.alumniAccount.update({
    where: { id },
    data: { status: "active", emailVerifiedAt: new Date() },
  });
  await logAudit({ session, action: "alumni.verify", resourceType: "alumni-account", resourceId: id, summary: "Email marked verified by staff" });
  redirect("/admin/alumni-accounts?updated=1");
}

export async function disableAlumniAccount(formData: FormData) {
  const session = await requirePermission("alumni.accounts");
  const id = String(formData.get("id") || "");
  await prisma.alumniAccount.update({
    where: { id },
    data: { status: "disabled" },
  });
  await logAudit({ session, action: "alumni.disable", resourceType: "alumni-account", resourceId: id, summary: "Account disabled" });
  redirect("/admin/alumni-accounts?updated=1");
}

export async function completeAlumniDeletion(formData: FormData) {
  const session = await requirePermission("alumni.accounts");
  const id = String(formData.get("id") || "");
  const account = await prisma.alumniAccount.findUnique({ where: { id } });
  if (!account) redirect("/admin/alumni-accounts");
  await prisma.alumniStory.updateMany({
    where: { submittedById: id },
    data: { personName: null, submittedById: null },
  });
  await prisma.alumniAccount.delete({ where: { id } });
  await logAudit({
    session,
    action: "alumni.delete",
    resourceType: "alumni-account",
    resourceId: id,
    summary: "Account deleted after request; published stories remain without a private name if they were public",
  });
  redirect("/admin/alumni-accounts?deleted=1");
}
