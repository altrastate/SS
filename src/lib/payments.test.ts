import assert from "node:assert/strict";
import test from "node:test";
import { hmacSha256 } from "./tokens";

test("disabled payment provider never reports success", async () => {
  const previousProvider = process.env.PAYMENTS_PROVIDER;
  const previousSecret = process.env.PAYMENTS_WEBHOOK_SECRET;
  try {
    delete process.env.PAYMENTS_PROVIDER;
    delete process.env.PAYMENTS_WEBHOOK_SECRET;
    const { getPaymentProvider, paymentsConfigured } = await import("./integrations/payments");
    assert.equal(paymentsConfigured(), false);
    const result = await getPaymentProvider().createCheckout({
      reference: "jico_test",
      amount: 5000,
      currency: "UGX",
      donorName: "Test",
      donorEmail: "test@example.com",
      description: "Test",
      returnUrl: "http://localhost:3000/support/donate/return",
    });
    assert.equal(result.ok, false);
    const webhook = await getPaymentProvider().verifyWebhook(new Headers(), "{}");
    assert.equal(webhook.ok, false);
  } finally {
    if (previousProvider) process.env.PAYMENTS_PROVIDER = previousProvider;
    else delete process.env.PAYMENTS_PROVIDER;
    if (previousSecret) process.env.PAYMENTS_WEBHOOK_SECRET = previousSecret;
    else delete process.env.PAYMENTS_WEBHOOK_SECRET;
  }
});

test("generic hmac provider rejects unsigned webhooks", async () => {
  const previousProvider = process.env.PAYMENTS_PROVIDER;
  const previousSecret = process.env.PAYMENTS_WEBHOOK_SECRET;
  try {
    process.env.PAYMENTS_PROVIDER = "generic";
    process.env.PAYMENTS_WEBHOOK_SECRET = "unit-test-secret";
    const { getPaymentProvider } = await import("./integrations/payments");
    const payload = JSON.stringify({ reference: "jico_abc", status: "succeeded", amount: 5000, currency: "UGX" });
    const unsigned = await getPaymentProvider().verifyWebhook(new Headers({ "content-type": "application/json" }), payload);
    assert.equal(unsigned.ok, false);
    const signed = await getPaymentProvider().verifyWebhook(
      new Headers({ "x-jico-signature": hmacSha256("unit-test-secret", payload) }),
      payload,
    );
    assert.equal(signed.ok, true);
    assert.equal(signed.status, "succeeded");
    assert.equal(signed.reference, "jico_abc");
  } finally {
    if (previousProvider) process.env.PAYMENTS_PROVIDER = previousProvider;
    else delete process.env.PAYMENTS_PROVIDER;
    if (previousSecret) process.env.PAYMENTS_WEBHOOK_SECRET = previousSecret;
    else delete process.env.PAYMENTS_WEBHOOK_SECRET;
  }
});
