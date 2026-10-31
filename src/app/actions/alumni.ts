"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { ALUMNI_COOKIE, alumniCookieOptions, createAlumniToken, getAlumniSession } from "@/lib/alumni-auth";
import { sendTransactionalEmail, smtpReady } from "@/lib/integrations/email";
import { getModuleFlags } from "@/lib/integrations/registry";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { issueAuthToken, consumeAuthToken } from "@/lib/tokens";
import { slugify, siteUrl } from "@/lib/utils";
import { z } from "zod";

export type FormState = { ok: boolean; message: string };

const GENERIC_AUTH = "If that email is registered with the alumni portal, further instructions have been sent.";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(10).max(100),
  graduationYear: z.string().trim().max(8).optional().or(z.literal("")),
  consent: z.literal("on"),
});

async function clientKey(prefix: string) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  return `${prefix}:${await hashIp(ip)}`;
}

export async function registerAlumni(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const flags = await getModuleFlags();
  if (!flags.alumniPortal) {
    return { ok: false, message: "The alumni portal is not enabled. The college has not activated alumni accounts yet." };
  }
  const limited = rateLimit(await clientKey("alumni-register"), 5);
  if (!limited.ok) return { ok: false, message: "Too many registration attempts. Please try again later." };

  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    graduationYear: String(formData.get("graduationYear") || ""),
    consent: formData.get("consent") ? "on" : "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter your name, a valid email address, a password of at least 10 characters, and consent." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.alumniAccount.findUnique({ where: { email } });
  if (!existing) {
    await prisma.alumniAccount.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
        graduationYear: parsed.data.graduationYear || null,
        status: "pending_verification",
      },
    });
    const token = await issueAuthToken("alumni_verify", email, 24);
    const link = `${siteUrl()}/alumni/portal/verify?token=${token}`;
    const mailed = await sendTransactionalEmail({
      to: email,
      kind: "alumni_verify",
      subject: "Verify your Jinja College alumni account",
      text: `Please confirm your alumni portal email by opening this link:\n${link}\n\nIf you did not request an account, you can ignore this message.`,
    });
    if (!mailed.sent) {
      return {
        ok: true,
        message:
          "Your account has been recorded. Email delivery is not configured, so a staff member must verify your email from the administration area before you can sign in.",
      };
    }
  }
  return {
    ok: true,
    message: "If this email can be registered, you will receive a verification message. Check your inbox.",
  };
}

export async function verifyAlumniEmail(token: string) {
  const record = await consumeAuthToken("alumni_verify", token);
  if (!record) return { ok: false, message: "This verification link is invalid or has expired." };
  await prisma.alumniAccount.updateMany({
    where: { email: record.email, status: "pending_verification" },
    data: { status: "active", emailVerifiedAt: new Date() },
  });
  return { ok: true, message: "Your email has been verified. You can now sign in." };
}

export async function loginAlumni(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const flags = await getModuleFlags();
  if (!flags.alumniPortal) {
    return { ok: false, message: "The alumni portal is not enabled." };
  }
  const limited = rateLimit(await clientKey("alumni-login"), 8);
  if (!limited.ok) return { ok: false, message: "Too many sign-in attempts. Please try again later." };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const account = await prisma.alumniAccount.findUnique({ where: { email } });
  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return { ok: false, message: "Those details were not recognised." };
  }
  if (account.status === "pending_verification") {
    return { ok: false, message: "This account is waiting for email verification." };
  }
  if (account.status === "disabled") {
    return { ok: false, message: "This account is not active." };
  }
  const token = await createAlumniToken({ sub: account.id, email: account.email, name: account.name });
  const jar = await cookies();
  jar.set(ALUMNI_COOKIE, token, alumniCookieOptions());
  const from = String(formData.get("from") || "/alumni/portal");
  redirect(from.startsWith("/alumni/portal") ? from : "/alumni/portal");
}

export async function logoutAlumni() {
  const jar = await cookies();
  jar.delete(ALUMNI_COOKIE);
  redirect("/alumni/portal/login");
}

export async function requestAlumniReset(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const limited = rateLimit(await clientKey("alumni-reset"), 5);
  if (!limited.ok) return { ok: true, message: GENERIC_AUTH };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const account = await prisma.alumniAccount.findUnique({ where: { email } });
  if (account && smtpReady()) {
    const token = await issueAuthToken("alumni_reset", email, 1);
    await sendTransactionalEmail({
      to: email,
      kind: "alumni_reset",
      subject: "Reset your Jinja College alumni password",
      text: `Reset your password using this link (valid for one hour):\n${siteUrl()}/alumni/portal/reset?token=${token}\n`,
    });
  }
  return { ok: true, message: GENERIC_AUTH };
}

export async function resetAlumniPassword(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 10) return { ok: false, message: "Choose a password of at least 10 characters." };
  const record = await consumeAuthToken("alumni_reset", token);
  if (!record) return { ok: false, message: "This reset link is invalid or has expired." };
  await prisma.alumniAccount.update({
    where: { email: record.email },
    data: { passwordHash: await hashPassword(password) },
  });
  return { ok: true, message: "Your password has been updated. You can now sign in." };
}

export async function updateAlumniProfile(formData: FormData) {
  const session = await getAlumniSession();
  if (!session) redirect("/alumni/portal/login");
  await prisma.alumniAccount.update({
    where: { id: session.sub },
    data: {
      name: String(formData.get("name") || session.name).trim().slice(0, 120),
      graduationYear: String(formData.get("graduationYear") || "").trim().slice(0, 8) || null,
      profession: String(formData.get("profession") || "").trim().slice(0, 160) || null,
      mentorshipInterest: formData.get("mentorshipInterest") === "on",
      supportInterest: formData.get("supportInterest") === "on",
      publicProfileConsent: formData.get("publicProfileConsent") === "on",
      announceEmail: formData.get("announceEmail") === "on",
      eventEmail: formData.get("eventEmail") === "on",
    },
  });
  redirect("/alumni/portal?saved=1");
}

export async function requestAlumniDeletion() {
  const session = await getAlumniSession();
  if (!session) redirect("/alumni/portal/login");
  await prisma.alumniAccount.update({
    where: { id: session.sub },
    data: { status: "deletion_requested", deletionRequestedAt: new Date() },
  });
  redirect("/alumni/portal?deleted=1");
}

export async function submitAlumniStory(formData: FormData) {
  const session = await getAlumniSession();
  if (!session) redirect("/alumni/portal/login");
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (title.length < 5 || summary.length < 10 || body.length < 20) {
    redirect("/alumni/portal?error=story");
  }
  const account = await prisma.alumniAccount.findUnique({ where: { id: session.sub } });
  await prisma.alumniStory.create({
    data: {
      title,
      slug: slugify(`${title}-${Date.now().toString().slice(-6)}`),
      summary,
      body,
      personName: account?.publicProfileConsent ? account.name : null,
      graduationYear: account?.graduationYear || null,
      status: "review",
      submittedById: session.sub,
    },
  });
  redirect("/alumni/portal?story=1");
}

export async function expressEventInterest(formData: FormData) {
  const session = await getAlumniSession();
  const name = String(formData.get("name") || session?.name || "").trim();
  const email = String(formData.get("email") || session?.email || "").trim().toLowerCase();
  const title = String(formData.get("title") || "Alumni event").trim();
  const fromRaw = String(formData.get("from") || "/alumni");
  const from =
    fromRaw.startsWith("/events") || fromRaw.startsWith("/alumni") || fromRaw.startsWith("/parent-communications")
      ? fromRaw.split("?")[0]
      : "/alumni";
  if (!name || !email.includes("@") || formData.get("consent") !== "on") {
    redirect(`${from}?error=interest`);
  }
  const limited = rateLimit(await clientKey("event-interest"), 8);
  if (!limited.ok) redirect(`${from}?error=limit`);
  await prisma.eventInterest.create({
    data: {
      eventId: String(formData.get("eventId") || "") || null,
      title,
      name,
      email,
      message: String(formData.get("message") || "").trim().slice(0, 2000) || null,
      consent: true,
      alumniId: session?.sub || null,
    },
  });
  redirect(`${from}?interest=1`);
}
