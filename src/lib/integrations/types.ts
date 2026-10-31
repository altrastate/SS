export type IntegrationStatus = {
  id: string;
  name: string;
  category: "email" | "payments" | "school-system" | "identity" | "calendar";
  enabled: boolean;
  configured: boolean;
  live: boolean;
  message: string;
  lastCheckedAt: Date;
};

export type PaymentCheckoutInput = {
  reference: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  description: string;
  returnUrl: string;
};

export type PaymentCheckoutResult =
  | { ok: true; status: "pending"; checkoutUrl?: string; reference: string }
  | { ok: false; error: string };

export type PaymentWebhookResult = {
  ok: boolean;
  reference?: string;
  status?: "pending" | "succeeded" | "failed" | "cancelled";
  amount?: number;
  currency?: string;
  providerEventId?: string;
  error?: string;
};

export type PaymentProvider = {
  id: string;
  name: string;
  configured: boolean;
  createCheckout(input: PaymentCheckoutInput): Promise<PaymentCheckoutResult>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<PaymentWebhookResult>;
  fetchStatus(reference: string): Promise<PaymentWebhookResult>;
};

export type SchoolSystemProvider = {
  id: string;
  name: string;
  configured: boolean;
  testConnection(): Promise<{ ok: boolean; message: string }>;
};
