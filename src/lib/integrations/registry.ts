import { emailStatus } from "@/lib/integrations/email";
import { paymentsStatus } from "@/lib/integrations/payments";
import { schoolSystemStatus } from "@/lib/integrations/school-system";
import { getSiteSettings } from "@/lib/content";
import type { IntegrationStatus } from "@/lib/integrations/types";

export async function getModuleFlags() {
  const settings = await getSiteSettings();
  return {
    alumniPortal: settings.alumniPortalEnabled === true,
    donationsPage: settings.donationsEnabled === true,
    communications: settings.communicationsEnabled === true,
    paymentsLive: false,
  };
}

function identityStatus(): IntegrationStatus {
  const configured = Boolean(process.env.AUTH_SECRET);
  return {
    id: "identity",
    name: "Website authentication",
    category: "identity",
    enabled: configured,
    configured,
    live: configured,
    message: configured
      ? "Admin and alumni sessions use signed cookies on this website. No third-party identity provider is connected."
      : "AUTH_SECRET is missing. Sessions cannot be signed until it is set in the server environment.",
    lastCheckedAt: new Date(),
  };
}

function calendarStatus(): IntegrationStatus {
  return {
    id: "calendar",
    name: "External calendar",
    category: "calendar",
    enabled: false,
    configured: false,
    live: false,
    message: "No external calendar provider is connected. Published dates are managed in the website content manager.",
    lastCheckedAt: new Date(),
  };
}

export function listIntegrations(): IntegrationStatus[] {
  return [identityStatus(), emailStatus(), paymentsStatus(), schoolSystemStatus(), calendarStatus()];
}
