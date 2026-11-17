import { prisma } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/integrations/email";
import { siteUrl } from "@/lib/utils";

export async function applyVerifiedPayment(input: {
  reference: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  amount?: number;
  currency?: string;
}) {
  const donation = await prisma.donation.findUnique({ where: { providerRef: input.reference } });
  if (!donation) return { ok: false as const, error: "Unknown payment reference." };
  if (donation.status === "succeeded") {
    return { ok: true as const, duplicate: true, donation };
  }
  if (typeof input.amount === "number" && input.amount !== donation.amount) {
    return { ok: false as const, error: "Amount does not match the recorded donation." };
  }
  if (input.currency && input.currency !== donation.currency) {
    return { ok: false as const, error: "Currency does not match the recorded donation." };
  }

  const updated = await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: input.status,
      confirmedAt: input.status === "succeeded" ? new Date() : donation.confirmedAt,
      failureReason: input.status === "failed" ? "Provider reported failure." : donation.failureReason,
    },
  });

  if (input.status === "succeeded") {
    await sendTransactionalEmail({
      to: updated.donorEmail,
      kind: "donation_receipt",
      resourceId: updated.id,
      subject: `Kapchorwa Senior Secondary School donation receipt ${updated.receiptToken.slice(0, 10)}`,
      text: [
        "This receipt is issued only after the payment provider confirmed the donation.",
        `Amount: ${updated.amount} ${updated.currency}`,
        `Date: ${updated.confirmedAt?.toISOString() || ""}`,
        `Receipt: ${siteUrl()}/support/receipt/${updated.receiptToken}`,
        "This website does not claim tax deductibility unless the college confirms it separately.",
      ].join("\n"),
    });
  }
  return { ok: true as const, duplicate: false, donation: updated };
}
