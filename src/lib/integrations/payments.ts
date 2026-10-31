import { hmacSha256, safeEqual } from "@/lib/tokens";
import type { IntegrationStatus, PaymentCheckoutInput, PaymentCheckoutResult, PaymentProvider, PaymentWebhookResult } from "@/lib/integrations/types";

export function paymentsConfigured() {
  return Boolean(process.env.PAYMENTS_PROVIDER && process.env.PAYMENTS_WEBHOOK_SECRET);
}

export function paymentsStatus(): IntegrationStatus {
  const provider = process.env.PAYMENTS_PROVIDER || "";
  const configured = paymentsConfigured();
  return {
    id: "payments",
    name: provider ? `Payments (${provider})` : "Payments",
    category: "payments",
    enabled: configured,
    configured,
    live: false,
    message: configured
      ? `Adapter '${provider}' is configured. Online donations stay pending until a verified webhook confirms payment. No provider is treated as live without school approval.`
      : "Online donations are disabled. Set PAYMENTS_PROVIDER and PAYMENTS_WEBHOOK_SECRET only after Jinja College approves a payment provider.",
    lastCheckedAt: new Date(),
  };
}

class DisabledPaymentProvider implements PaymentProvider {
  id = "disabled";
  name = "Not configured";
  configured = false;
  async createCheckout(): Promise<PaymentCheckoutResult> {
    return { ok: false, error: "Online donations are not enabled. The college has not configured an approved payment provider." };
  }
  async verifyWebhook(): Promise<PaymentWebhookResult> {
    return { ok: false, error: "Payment webhooks are not configured." };
  }
  async fetchStatus(): Promise<PaymentWebhookResult> {
    return { ok: false, error: "Payment status cannot be fetched because no provider is configured." };
  }
}

class GenericHmacProvider implements PaymentProvider {
  id = process.env.PAYMENTS_PROVIDER || "generic";
  name = "Generic signed webhook adapter";
  configured = true;

  async createCheckout(input: PaymentCheckoutInput): Promise<PaymentCheckoutResult> {
    const checkoutBase = process.env.PAYMENTS_CHECKOUT_URL;
    if (!checkoutBase) {
      return {
        ok: true,
        status: "pending",
        reference: input.reference,
      };
    }
    const url = new URL(checkoutBase);
    url.searchParams.set("reference", input.reference);
    url.searchParams.set("amount", String(input.amount));
    url.searchParams.set("currency", input.currency);
    url.searchParams.set("return", input.returnUrl);
    return { ok: true, status: "pending", reference: input.reference, checkoutUrl: url.toString() };
  }

  async verifyWebhook(headers: Headers, rawBody: string): Promise<PaymentWebhookResult> {
    const secret = process.env.PAYMENTS_WEBHOOK_SECRET || "";
    const signature = headers.get("x-jico-signature") || headers.get("x-webhook-signature") || "";
    if (!secret || !signature || !safeEqual(signature, hmacSha256(secret, rawBody))) {
      return { ok: false, error: "Invalid webhook signature." };
    }
    try {
      const body = JSON.parse(rawBody) as {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        eventId?: string;
      };
      const status =
        body.status === "succeeded" || body.status === "failed" || body.status === "cancelled" || body.status === "pending"
          ? body.status
          : undefined;
      if (!body.reference || !status) {
        return { ok: false, error: "Webhook payload is missing a reference or status." };
      }
      return {
        ok: true,
        reference: body.reference,
        status,
        amount: typeof body.amount === "number" ? body.amount : undefined,
        currency: body.currency,
        providerEventId: body.eventId,
      };
    } catch {
      return { ok: false, error: "Webhook payload is not valid JSON." };
    }
  }

  async fetchStatus(reference: string): Promise<PaymentWebhookResult> {
    const endpoint = process.env.PAYMENTS_STATUS_URL;
    const secret = process.env.PAYMENTS_SECRET || process.env.PAYMENTS_WEBHOOK_SECRET || "";
    if (!endpoint || !secret) {
      return { ok: false, error: "Payment status lookup is not configured." };
    }
    try {
      const response = await fetch(`${endpoint}?reference=${encodeURIComponent(reference)}`, {
        headers: { authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      if (!response.ok) return { ok: false, error: "The payment provider rejected the status request." };
      const body = (await response.json()) as { status?: string; amount?: number; currency?: string };
      const status =
        body.status === "succeeded" || body.status === "failed" || body.status === "cancelled" || body.status === "pending"
          ? body.status
          : undefined;
      if (!status) return { ok: false, error: "The provider did not return a recognised status." };
      return { ok: true, reference, status, amount: body.amount, currency: body.currency };
    } catch {
      return { ok: false, error: "The payment provider could not be reached." };
    }
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (!paymentsConfigured()) return new DisabledPaymentProvider();
  return new GenericHmacProvider();
}
