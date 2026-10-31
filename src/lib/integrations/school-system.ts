import { prisma } from "@/lib/db";
import type { IntegrationStatus, SchoolSystemProvider } from "@/lib/integrations/types";

export function schoolSystemConfigured() {
  return Boolean(process.env.SCHOOL_SYSTEM_BASE_URL && process.env.SCHOOL_SYSTEM_API_KEY);
}

export function schoolSystemStatus(): IntegrationStatus {
  const configured = schoolSystemConfigured();
  return {
    id: "school-system",
    name: process.env.SCHOOL_SYSTEM_NAME || "School management system",
    category: "school-system",
    enabled: false,
    configured,
    live: false,
    message: configured
      ? "Credentials are present, but student-record synchronisation is disabled until the college approves a data scope. This website will not import student records by default."
      : "No school-management system is connected. This website is not a student information system.",
    lastCheckedAt: new Date(),
  };
}

class DisabledSchoolSystem implements SchoolSystemProvider {
  id = "none";
  name = "Not connected";
  configured = false;
  async testConnection() {
    return { ok: false, message: "No school-system URL or API key is configured." };
  }
}

class HttpSchoolSystem implements SchoolSystemProvider {
  id = "http";
  name = process.env.SCHOOL_SYSTEM_NAME || "School management system";
  configured = true;
  async testConnection() {
    const url = process.env.SCHOOL_SYSTEM_BASE_URL;
    const key = process.env.SCHOOL_SYSTEM_API_KEY;
    if (!url || !key) return { ok: false, message: "Missing school-system configuration." };
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: { authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      const ok = response.ok || response.status === 401 || response.status === 403;
      const message = ok
        ? `Reached ${url} (HTTP ${response.status}). No student data was imported.`
        : `The system responded with HTTP ${response.status}. No student data was imported.`;
      await prisma.integrationLog.create({
        data: { provider: "school-system", action: "test", success: response.ok, message },
      });
      return { ok: response.ok, message };
    } catch {
      await prisma.integrationLog.create({
        data: { provider: "school-system", action: "test", success: false, message: "The school system could not be reached." },
      });
      return { ok: false, message: "The school system could not be reached." };
    }
  }
}

export function getSchoolSystemProvider(): SchoolSystemProvider {
  if (!schoolSystemConfigured()) return new DisabledSchoolSystem();
  return new HttpSchoolSystem();
}
