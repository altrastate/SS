export const ROLES = [
  "super_admin",
  "school_admin",
  "editor",
  "admissions_officer",
  "alumni_officer",
  "communications_officer",
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "dashboard",
  "settings",
  "users",
  "audit",
  "analytics",
  "news",
  "news.publish",
  "events",
  "events.publish",
  "enquiries",
  "downloads",
  "media",
  "alumni",
  "alumni.publish",
  "alumni.accounts",
  "projects",
  "projects.publish",
  "donations",
  "communications",
  "communications.send",
  "integrations",
  "faqs",
  "staff",
  "gallery",
  "academics",
  "campus",
  "timeline",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL = PERMISSIONS;

const SCHOOL_ADMIN: Permission[] = PERMISSIONS.filter((item) => item !== "users" && item !== "integrations");

const EDITOR: Permission[] = [
  "dashboard",
  "news",
  "events",
  "downloads",
  "media",
  "alumni",
  "projects",
  "faqs",
  "staff",
  "gallery",
  "academics",
  "campus",
  "timeline",
];

const ADMISSIONS: Permission[] = ["dashboard", "enquiries"];

const ALUMNI: Permission[] = [
  "dashboard",
  "alumni",
  "alumni.publish",
  "alumni.accounts",
  "projects",
  "projects.publish",
  "donations",
  "media",
];

const COMMUNICATIONS: Permission[] = ["dashboard", "communications", "communications.send"];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: ALL,
  school_admin: SCHOOL_ADMIN,
  editor: EDITOR,
  admissions_officer: ADMISSIONS,
  alumni_officer: ALUMNI,
  communications_officer: COMMUNICATIONS,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  editor: "Editor",
  admissions_officer: "Admissions Officer",
  alumni_officer: "Alumni / Development Officer",
  communications_officer: "Communications Officer",
};

export function normalizeRole(role: string | null | undefined): Role {
  if (role === "admin" || role === "super_admin") return "super_admin";
  if ((ROLES as readonly string[]).includes(role || "")) return role as Role;
  return "editor";
}

export function can(role: string | null | undefined, permission: Permission) {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized].includes(permission);
}

export function canPublish(role: string | null | undefined, resource: "news" | "events" | "alumni" | "projects" | "content") {
  if (resource === "news") return can(role, "news.publish");
  if (resource === "events") return can(role, "events.publish");
  if (resource === "alumni") return can(role, "alumni.publish");
  if (resource === "projects") return can(role, "projects.publish");
  return can(role, "news.publish") || can(role, "settings");
}

export function resolveContentStatus(requested: string, allowedToPublish: boolean) {
  const value = requested.trim();
  if (value === "published" && !allowedToPublish) return "review";
  if (value === "archived" && !allowedToPublish) return "draft";
  if (value === "review" || value === "draft" || value === "published" || value === "archived") return value;
  return "draft";
}

export function isAssignableRole(role: string): role is Role {
  return (ROLES as readonly string[]).includes(role);
}

export const COMMUNICATION_CATEGORIES = [
  { id: "general", label: "General school notices" },
  { id: "admissions", label: "Admissions announcements" },
  { id: "events", label: "Events" },
  { id: "alumni", label: "Alumni / community updates" },
] as const;
