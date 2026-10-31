import nodemailer from "nodemailer";

export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      process.env.ENQUIRY_NOTIFY_EMAIL,
  );
}

export async function sendEnquiryNotification(input: {
  type: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category: string;
  admissionLevel?: string | null;
  message: string;
}) {
  if (!mailConfigured()) {
    return { sent: false, reason: "Email delivery is not configured." as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject =
    input.type === "admissions"
      ? `Admissions enquiry from ${input.name}`
      : `Website enquiry from ${input.name}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ENQUIRY_NOTIFY_EMAIL,
    replyTo: input.email || undefined,
    subject,
    text: [
      `Type: ${input.type}`,
      `Name: ${input.name}`,
      `Email: ${input.email || "Not provided"}`,
      `Telephone: ${input.phone || "Not provided"}`,
      `Category: ${input.category}`,
      `Admission level: ${input.admissionLevel || "Not specified"}`,
      "",
      input.message,
    ].join("\n"),
  });

  return { sent: true as const };
}
