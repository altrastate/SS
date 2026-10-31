type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;

export function rateLimit(key: string, limit = LIMIT, windowMs = WINDOW_MS) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count };
}

export async function hashIp(ip: string) {
  const secret = process.env.AUTH_SECRET || "local-dev-only";
  const data = new TextEncoder().encode(`${secret}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
