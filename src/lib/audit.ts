import { prisma } from "@/lib/db";
import type { AdminSession } from "@/lib/auth";

export async function logAudit(input: {
  session?: AdminSession | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  summary?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.session?.sub || null,
        actorEmail: input.session?.email || null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId || null,
        summary: input.summary || null,
      },
    });
  } catch (error) {
    console.error("Audit log write failed.", error);
  }
}
