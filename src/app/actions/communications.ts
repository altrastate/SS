"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/guard";
import { getModuleFlags } from "@/lib/integrations/registry";
import { sendTransactionalEmail, smtpReady } from "@/lib/integrations/email";
import { COMMUNICATION_CATEGORIES } from "@/lib/permissions";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { consumeAuthToken, issueAuthToken } from "@/lib/tokens";
import { siteUrl } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export type SubscribeState = { ok: boolean; message: string };

const allowedCategories = new Set<string>(COMMUNICATION_CATEGORIES.map((item) => item.id));

function parseCategories(formData: FormData) {
  const selected = formData.getAll("categories").map(String).filter((item) => allowedCategories.has(item));
  return selected.length ? selected : ["general"];
}

export async function subscribeNotices(_prev: SubscribeState | undefined, formData: FormData): Promise<SubscribeState> {
  const flags = await getModuleFlags();
  if (!flags.communications) {
    return { ok: false, message: "Notice subscriptions are not enabled yet." };
  }
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`subscribe:${await hashIp(ip)}`, 6).ok) {
    return { ok: false, message: "Too many subscription attempts. Please try again later." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim().slice(0, 120);
  if (!email.includes("@") || formData.get("consent") !== "on") {
    return { ok: false, message: "Enter an email address and confirm that you want to subscribe." };
  }
  const categories = parseCategories(formData);
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing?.status === "active") {
    return { ok: true, message: "If this email can be subscribed, a confirmation message will be sent." };
  }
  await prisma.subscriber.upsert({
    where: { email },
    update: {
      name: name || existing?.name,
      categoriesJson: JSON.stringify(categories),
      status: "pending",
      consentAt: new Date(),
      unsubscribedAt: null,
    },
    create: {
      email,
      name: name || null,
      categoriesJson: JSON.stringify(categories),
      status: "pending",
      consentAt: new Date(),
    },
  });
  const token = await issueAuthToken("subscriber_verify", email, 48);
  const mailed = await sendTransactionalEmail({
    to: email,
    kind: "subscriber_verify",
    subject: "Confirm your Kapchorwa Senior Secondary School notices subscription",
    text: `Confirm your subscription:\n${siteUrl()}/parent-communications/confirm?token=${token}\n\nUnsubscribe at any time: ${siteUrl()}/parent-communications/unsubscribe?email=${encodeURIComponent(email)}`,
  });
  if (!mailed.sent) {
    return {
      ok: true,
      message:
        "Your subscription request has been stored. Email confirmation is not configured, so a staff member must verify the address before notices can be sent.",
    };
  }
  return { ok: true, message: "Please check your email to confirm this subscription. We will not send notices until you confirm." };
}

export async function confirmSubscription(token: string) {
  const record = await consumeAuthToken("subscriber_verify", token);
  if (!record) return { ok: false, message: "This confirmation link is invalid or has expired." };
  await prisma.subscriber.updateMany({
    where: { email: record.email },
    data: { status: "active", verifiedAt: new Date(), unsubscribedAt: null },
  });
  return { ok: true, message: "Your subscription is confirmed. You can unsubscribe from any notice email." };
}

export async function unsubscribeNotices(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, message: "That email address is not valid." };
  await prisma.subscriber.updateMany({
    where: { email },
    data: { status: "unsubscribed", unsubscribedAt: new Date() },
  });
  return { ok: true, message: "If that address was subscribed, it has now been unsubscribed." };
}

export async function saveCampaign(formData: FormData) {
  const session = await requirePermission("communications");
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (title.length < 3 || subject.length < 3 || body.length < 10) {
    redirect(id ? `/admin/communications?id=${id}&error=draft` : "/admin/communications?error=draft");
  }
  const data = {
    title,
    subject,
    body,
    category: allowedCategories.has(String(formData.get("category"))) ? String(formData.get("category")) : "general",
    status: "draft",
    createdById: session.sub,
  };
  const saved = id
    ? await prisma.campaign.update({ where: { id }, data })
    : await prisma.campaign.create({ data });
  await logAudit({ session, action: "campaign.save", resourceType: "campaign", resourceId: saved.id, summary: saved.title });
  redirect(`/admin/communications?id=${saved.id}`);
}

export async function sendCampaignTest(formData: FormData) {
  const session = await requirePermission("communications.send");
  const id = String(formData.get("id") || "");
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) redirect("/admin/communications");
  if (!smtpReady()) redirect(`/admin/communications?id=${id}&error=smtp`);
  await sendTransactionalEmail({
    to: session.email,
    kind: "campaign_test",
    resourceId: campaign.id,
    subject: `[TEST] ${campaign.subject}`,
    text: `${campaign.body}\n\nThis was a test message to ${session.email}. Unsubscribe: ${siteUrl()}/parent-communications/unsubscribe`,
  });
  await logAudit({ session, action: "campaign.test", resourceType: "campaign", resourceId: id, summary: "Test send to operator only" });
  redirect(`/admin/communications?id=${id}&tested=1`);
}

export async function sendCampaign(formData: FormData) {
  const session = await requirePermission("communications.send");
  const id = String(formData.get("id") || "");
  const confirmation = String(formData.get("confirm") || "");
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.status === "sent") redirect("/admin/communications");
  const recipients = await prisma.subscriber.findMany({
    where: { status: "active", verifiedAt: { not: null } },
  });
  const eligible = recipients.filter((item) => {
    let cats: string[] = [];
    try {
      const parsed = JSON.parse(item.categoriesJson || "[]");
      cats = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      cats = [];
    }
    return cats.includes(campaign.category) || cats.includes("general");
  });
  if (confirmation !== `SEND ${eligible.length}`) {
    redirect(`/admin/communications?id=${id}&error=confirm&count=${eligible.length}`);
  }
  if (!smtpReady()) redirect(`/admin/communications?id=${id}&error=smtp`);

  let sentCount = 0;
  let failCount = 0;
  for (const recipient of eligible) {
    const result = await sendTransactionalEmail({
      to: recipient.email,
      kind: "campaign",
      resourceId: campaign.id,
      subject: campaign.subject,
      text: `${campaign.body}\n\nUnsubscribe: ${siteUrl()}/parent-communications/unsubscribe?email=${encodeURIComponent(recipient.email)}`,
    });
    await prisma.campaignDelivery.create({
      data: {
        campaignId: campaign.id,
        email: recipient.email,
        status: result.sent ? "sent" : "failed",
        error: result.sent ? null : result.reason,
        sentAt: result.sent ? new Date() : null,
      },
    });
    if (result.sent) sentCount += 1;
    else failCount += 1;
  }
  await prisma.campaign.update({
    where: { id },
    data: {
      status: "sent",
      sentAt: new Date(),
      recipientCount: eligible.length,
      sentCount,
      failCount,
    },
  });
  await logAudit({
    session,
    action: "campaign.send",
    resourceType: "campaign",
    resourceId: id,
    summary: `Sent to ${sentCount} of ${eligible.length} confirmed subscribers`,
  });
  redirect(`/admin/communications?id=${id}&sent=1`);
}

export async function cancelCampaign(formData: FormData) {
  const session = await requirePermission("communications.send");
  const id = String(formData.get("id") || "");
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.status === "sent") redirect("/admin/communications");
  await prisma.campaign.update({ where: { id }, data: { status: "cancelled" } });
  await logAudit({ session, action: "campaign.cancel", resourceType: "campaign", resourceId: id, summary: campaign.title });
  redirect("/admin/communications?cancelled=1");
}

export async function verifySubscriber(formData: FormData) {
  const session = await requirePermission("communications");
  const id = String(formData.get("id") || "");
  await prisma.subscriber.update({
    where: { id },
    data: { status: "active", verifiedAt: new Date(), unsubscribedAt: null },
  });
  await logAudit({
    session,
    action: "subscriber.verify",
    resourceType: "subscriber",
    resourceId: id,
    summary: "Staff confirmed a subscription because email verification was unavailable or requested",
  });
  redirect("/admin/subscribers?updated=1");
}

export async function adminUnsubscribeSubscriber(formData: FormData) {
  const session = await requirePermission("communications");
  const id = String(formData.get("id") || "");
  await prisma.subscriber.update({
    where: { id },
    data: { status: "unsubscribed", unsubscribedAt: new Date() },
  });
  await logAudit({ session, action: "subscriber.unsubscribe", resourceType: "subscriber", resourceId: id, summary: "Unsubscribed by staff" });
  redirect("/admin/subscribers?updated=1");
}
