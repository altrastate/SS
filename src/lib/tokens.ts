import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hmacSha256(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function issueAuthToken(purpose: string, email: string, hours: number) {
  const token = randomToken();
  await prisma.authToken.create({
    data: {
      purpose,
      email: email.toLowerCase(),
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  });
  return token;
}

export async function consumeAuthToken(purpose: string, token: string) {
  const record = await prisma.authToken.findFirst({
    where: {
      purpose,
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) return null;
  await prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record;
}
