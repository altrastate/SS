import { getPrisma } from "@/lib/db";

const PUBLIC_PREFIXES = [
  "/",
  "/about",
  "/academics",
  "/admissions",
  "/campus-life",
  "/news",
  "/alumni",
  "/contact",
  "/privacy",
  "/search",
  "/events",
  "/downloads",
  "/support",
  "/parent-communications",
];

export function isPublicAnalyticsPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return false;
  if (path.includes("..") || path.length > 180) return false;
  if (path.startsWith("/alumni/portal")) return false;
  if (path.startsWith("/support/receipt")) return false;
  if (path.startsWith("/support/donate/return")) return false;
  if (path.startsWith("/parent-communications/confirm")) return false;
  if (path.startsWith("/parent-communications/unsubscribe")) return false;
  if (path === "/") return true;
  return PUBLIC_PREFIXES.filter((prefix) => prefix !== "/").some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export async function recordAnalyticsEvent(type: string, path: string, meta?: string | null) {
  if (!isPublicAnalyticsPath(path)) return;
  try {
    const db = getPrisma();
    if (!db) return;
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
      select: { analyticsEnabled: true },
    });
    if (settings && settings.analyticsEnabled === false) return;
    await db.analyticsEvent.create({
      data: {
        type,
        path: path.slice(0, 180),
        meta: meta ? meta.slice(0, 80) : null,
      },
    });
  } catch (error) {
    console.error("Analytics write failed.", error);
  }
}

export function sanitizeSearchTerm(query: string) {
  const trimmed = query.trim().slice(0, 80);
  if (!trimmed) return null;
  if (trimmed.includes("@") || /^\+?\d[\d\s-]{6,}$/.test(trimmed)) return null;
  return trimmed.toLowerCase();
}
