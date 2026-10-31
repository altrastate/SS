"use server";

import { headers } from "next/headers";
import { getPrisma, prisma } from "@/lib/db";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { mailConfigured, sendEnquiryNotification } from "@/lib/mail";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { enquirySchema } from "@/lib/validations";

export type EnquiryState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function submitEnquiry(
  _prev: EnquiryState | undefined,
  formData: FormData,
): Promise<EnquiryState> {
  const raw = {
    type: String(formData.get("type") || "contact"),
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    category: String(formData.get("category") || ""),
    admissionLevel: String(formData.get("admissionLevel") || ""),
    message: String(formData.get("message") || ""),
    consent: formData.get("consent") ? "on" : "",
    website: String(formData.get("website") || ""),
  };

  if (raw.website) {
    return { ok: false, message: "The enquiry could not be submitted." };
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const ipHash = await hashIp(ip);
  const limited = rateLimit(`enquiry:${ipHash}`);
  if (!limited.ok) {
    return {
      ok: false,
      message: "Too many enquiries have been sent from this connection. Please try again later.",
    };
  }

  const admissionLevel =
    parsed.data.type === "admissions"
      ? parsed.data.admissionLevel || (parsed.data.category.startsWith("S1") ? "S1" : parsed.data.category.startsWith("S5") ? "S5" : "general")
      : null;

  if (!getPrisma()) {
    return {
      ok: false,
      message:
        "The online enquiry desk is not connected yet. Please contact the college office on +256 772 521 175 or 0393 001 062.",
    };
  }

  try {
    await prisma.enquiry.create({
      data: {
        type: parsed.data.type,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        category: parsed.data.category,
        admissionLevel,
        message: parsed.data.message,
        consent: true,
        status: "new",
        ipHash,
      },
    });
  } catch {
    return {
      ok: false,
      message: "The enquiry could not be saved. Please try again, or contact the school office directly.",
    };
  }

  await recordAnalyticsEvent("form_complete", parsed.data.type === "admissions" ? "/admissions" : "/contact");

  if (!mailConfigured()) {
    await prisma.notificationLog.create({
      data: {
        kind: parsed.data.type === "admissions" ? "admissions_enquiry" : "contact_enquiry",
        success: false,
        error: "Email delivery is not configured.",
      },
    });
    return {
      ok: true,
      message:
        "Your enquiry has been recorded for the school office. Email notification is not yet configured, so please also follow up by telephone or in person if your matter is urgent.",
    };
  }

  try {
    const result = await sendEnquiryNotification({
      ...parsed.data,
      admissionLevel,
    });
    await prisma.notificationLog.create({
      data: {
        kind: parsed.data.type === "admissions" ? "admissions_enquiry" : "contact_enquiry",
        success: result.sent,
        error: result.sent ? null : "reason" in result ? result.reason : "Unknown delivery error",
      },
    });
    if (!result.sent) {
      return {
        ok: true,
        message:
          "Your enquiry has been recorded for the school office, but the notification email could not be sent. If your matter is urgent, please follow up using the published contact details.",
      };
    }
    return {
      ok: true,
      message: "Thank you. Your enquiry has been received and a notification has been sent to the school office.",
    };
  } catch {
    await prisma.notificationLog.create({
      data: {
        kind: parsed.data.type === "admissions" ? "admissions_enquiry" : "contact_enquiry",
        success: false,
        error: "SMTP provider rejected or failed the message.",
      },
    });
    return {
      ok: true,
      message:
        "Your enquiry has been recorded for the school office, but the notification email could not be sent. If your matter is urgent, please follow up using the published contact details.",
    };
  }
}
