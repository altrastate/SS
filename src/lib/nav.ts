import type { Permission } from "@/lib/permissions";

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/campus-life", label: "Campus Life" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = [
  { href: "/about", label: "About the school" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/campus-life", label: "Campus Life" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/downloads", label: "Downloads" },
  { href: "/alumni", label: "Alumni & Development" },
  { href: "/support", label: "Support the school" },
  { href: "/parent-communications", label: "Notices" },
  { href: "/search", label: "Search" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Notice" },
] as const;

export const adminNav: Array<{
  href: string;
  label: string;
  permission: Permission;
  group: string;
}> = [
  { href: "/admin", label: "Overview", permission: "dashboard", group: "Home" },
  { href: "/admin/news", label: "News", permission: "news", group: "Content" },
  { href: "/admin/events", label: "Events", permission: "events", group: "Content" },
  { href: "/admin/faqs", label: "FAQs", permission: "faqs", group: "Content" },
  { href: "/admin/staff", label: "Leadership", permission: "staff", group: "Content" },
  { href: "/admin/gallery", label: "Gallery", permission: "gallery", group: "Content" },
  { href: "/admin/academics", label: "Academics", permission: "academics", group: "Content" },
  { href: "/admin/campus-life", label: "Campus life", permission: "campus", group: "Content" },
  { href: "/admin/timeline", label: "Timeline", permission: "timeline", group: "Content" },
  { href: "/admin/enquiries", label: "Enquiries", permission: "enquiries", group: "Operations" },
  { href: "/admin/downloads", label: "Downloads", permission: "downloads", group: "Operations" },
  { href: "/admin/media", label: "Media library", permission: "media", group: "Operations" },
  { href: "/admin/alumni", label: "Alumni stories", permission: "alumni", group: "Community" },
  { href: "/admin/alumni-accounts", label: "Alumni accounts", permission: "alumni.accounts", group: "Community" },
  { href: "/admin/projects", label: "Projects", permission: "projects", group: "Community" },
  { href: "/admin/donations", label: "Donations", permission: "donations", group: "Community" },
  { href: "/admin/communications", label: "Communications", permission: "communications", group: "Operations" },
  { href: "/admin/subscribers", label: "Subscribers", permission: "communications", group: "Operations" },
  { href: "/admin/integrations", label: "Integrations", permission: "integrations", group: "System" },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics", group: "System" },
  { href: "/admin/audit", label: "Audit log", permission: "audit", group: "System" },
  { href: "/admin/users", label: "Users and roles", permission: "users", group: "System" },
  { href: "/admin/settings", label: "Site settings", permission: "settings", group: "System" },
];
