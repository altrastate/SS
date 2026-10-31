import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import type { IntegrationStatus } from "@/lib/integrations/types";

export function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
}

export function emailStatus(): IntegrationStatus {
  const configured = smtpReady();
  return {
    id: "smtp",
    name: "SMTP email",
    category: "email",
    enabled: configured,
    configured,
    live: configured,
    message: configured
      ? "SMTP credentials are present. Delivery still depends on the provider accepting each message."
      : "SMTP is not configured. Verification, receipts, and campaigns will not be emailed until SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM are set.",
    lastCheckedAt: new Date(),
  };
}

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  kind: string;
  resourceId?: string;
}) {
  if (!smtpReady()) {
    await prisma.notificationLog.create({
      data: { kind: input.kind, resourceId: input.resourceId, success: false, error: "SMTP is not configured." },
    });
    return { sent: false as const, reason: "Email delivery is not configured." };
  }
  try {
    await transporter().sendMail({
      from: process.env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    await prisma.notificationLog.create({
      data: { kind: input.kind, resourceId: input.resourceId, success: true },
    });
    return { sent: true as const };
  } catch {
    await prisma.notificationLog.create({
      data: {
        kind: input.kind,
        resourceId: input.resourceId,
        success: false,
        error: "SMTP provider rejected or failed the message.",
      },
    });
    return { sent: false as const, reason: "The email provider did not accept the message." };
  }
}

export async function testEmailConnection() {
  if (!smtpReady()) {
    await prisma.integrationLog.create({
      data: { provider: "smtp", action: "test", success: false, message: "Missing SMTP environment variables." },
    });
    return { ok: false, message: "SMTP environment variables are missing." };
  }
  try {
    await transporter().verify();
    await prisma.integrationLog.create({
      data: { provider: "smtp", action: "test", success: true, message: "SMTP accepted a connection test." },
    });
    return { ok: true, message: "SMTP accepted a connection test." };
  } catch {
    await prisma.integrationLog.create({
      data: { provider: "smtp", action: "test", success: false, message: "SMTP connection test failed." },
    });
    return { ok: false, message: "SMTP connection test failed." };
  }
}
