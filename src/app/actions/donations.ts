"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getModuleFlags } from "@/lib/integrations/registry";
import { getPaymentProvider, paymentsConfigured } from "@/lib/integrations/payments";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { randomToken } from "@/lib/tokens";
import { siteUrl } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export type DonateState = { ok: boolean; message: string };

const donateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  amount: z.coerce.number().int().min(1000).max(100000000),
  projectId: z.string().optional().or(z.literal("")),
  consent: z.literal("on"),
});

export async function createDonation(_prev: DonateState | undefined, formData: FormData): Promise<DonateState> {
  const flags = await getModuleFlags();
  if (!flags.donationsPage || !paymentsConfigured()) {
    return {
      ok: false,
      message: "Online donations are not enabled. Jinja College has not approved a payment provider for this website.",
    };
  }
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`donate:${await hashIp(ip)}`, 5);
  if (!limited.ok) return { ok: false, message: "Too many donation attempts. Please try again later." };

  const parsed = donateSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    amount: String(formData.get("amount") || ""),
    projectId: String(formData.get("projectId") || ""),
    consent: formData.get("consent") ? "on" : "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter your name, email, a whole amount in UGX, and confirm consent. Do not include card or mobile-money secrets." };
  }

  const projectId: string | null = parsed.data.projectId || null;
  if (projectId) {
    const project = await prisma.developmentProject.findUnique({ where: { id: projectId } });
    if (!project || project.status !== "published" || !project.acceptDonations) {
      return { ok: false, message: "That project is not open for online support." };
    }
  }

  const provider = getPaymentProvider();
  const reference = `jico_${randomToken(12)}`;
  const receiptToken = randomToken(24);
  const donation = await prisma.donation.create({
    data: {
      projectId,
      donorName: parsed.data.name,
      donorEmail: parsed.data.email.toLowerCase(),
      amount: parsed.data.amount,
      currency: "UGX",
      status: "pending",
      provider: provider.id,
      providerRef: reference,
      receiptToken,
      idempotencyKey: reference,
    },
  });

  const checkout = await provider.createCheckout({
    reference,
    amount: parsed.data.amount,
    currency: "UGX",
    donorName: parsed.data.name,
    donorEmail: parsed.data.email,
    description: "Jinja College development support",
    returnUrl: `${siteUrl()}/support/donate/return?ref=${encodeURIComponent(reference)}`,
  });

  if (!checkout.ok) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: "failed", failureReason: checkout.error },
    });
    return { ok: false, message: checkout.error };
  }

  if (checkout.checkoutUrl) {
    redirect(checkout.checkoutUrl);
  }
  redirect(`/support/donate/return?ref=${encodeURIComponent(reference)}`);
}

export async function markDonationManual(formData: FormData) {
  const { requirePermission } = await import("@/lib/guard");
  const session = await requirePermission("donations");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["failed", "cancelled"].includes(status)) {
    redirect("/admin/donations?error=status");
  }
  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation || donation.status === "succeeded") redirect("/admin/donations");
  await prisma.donation.update({ where: { id }, data: { status } });
  await logAudit({
    session,
    action: "donation.update",
    resourceType: "donation",
    resourceId: id,
    summary: `Marked ${status} without claiming provider success`,
  });
  redirect("/admin/donations?updated=1");
}
