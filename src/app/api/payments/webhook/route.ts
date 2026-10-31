import { NextResponse } from "next/server";
import { applyVerifiedPayment } from "@/lib/donations-service";
import { getPaymentProvider, paymentsConfigured } from "@/lib/integrations/payments";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  if (!paymentsConfigured()) {
    return NextResponse.json({ ok: false, error: "Payments are not configured." }, { status: 404 });
  }
  const rawBody = await request.text();
  const result = await getPaymentProvider().verifyWebhook(request.headers, rawBody);
  if (!result.ok || !result.reference || !result.status) {
    await prisma.integrationLog.create({
      data: {
        provider: getPaymentProvider().id,
        action: "webhook",
        success: false,
        message: result.error || "Rejected webhook.",
      },
    });
    return NextResponse.json({ ok: false, error: result.error || "Rejected." }, { status: 400 });
  }
  const applied = await applyVerifiedPayment({
    reference: result.reference,
    status: result.status,
    amount: result.amount,
    currency: result.currency,
  });
  if (!applied.ok) {
    return NextResponse.json({ ok: false, error: applied.error }, { status: 400 });
  }
  await prisma.integrationLog.create({
    data: {
      provider: getPaymentProvider().id,
      action: "webhook",
      success: true,
      message: applied.duplicate ? `Duplicate callback for ${result.reference}` : `Recorded ${result.status} for ${result.reference}`,
    },
  });
  return NextResponse.json({ ok: true, duplicate: applied.duplicate === true });
}
