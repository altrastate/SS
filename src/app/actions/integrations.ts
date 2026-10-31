"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/guard";
import { testEmailConnection } from "@/lib/integrations/email";
import { getSchoolSystemProvider } from "@/lib/integrations/school-system";
import { logAudit } from "@/lib/audit";

export async function testSmtpIntegration() {
  const session = await requirePermission("integrations");
  const result = await testEmailConnection();
  await logAudit({
    session,
    action: "integration.test",
    resourceType: "integration",
    resourceId: "smtp",
    summary: result.ok ? "SMTP test succeeded" : "SMTP test failed",
  });
  redirect(`/admin/integrations?smtp=${result.ok ? "ok" : "fail"}`);
}

export async function testSchoolSystemIntegration() {
  const session = await requirePermission("integrations");
  const result = await getSchoolSystemProvider().testConnection();
  await logAudit({
    session,
    action: "integration.test",
    resourceType: "integration",
    resourceId: "school-system",
    summary: result.message,
  });
  redirect(`/admin/integrations?school=${result.ok ? "ok" : "fail"}`);
}
