import { getPrisma } from "@/lib/db";
import { isPublished } from "@/lib/utils";

export type SearchHit = {
  type: "page" | "news" | "event" | "document" | "alumni" | "project";
  title: string;
  summary: string;
  href: string;
};

const STATIC_PAGES: SearchHit[] = [
  {
    type: "page",
    title: "Home",
    summary: "Kapchorwa Senior Secondary School, a government-aided mixed day school in Kawowo, Kapchorwa Municipality.",
    href: "/",
  },
  {
    type: "page",
    title: "About the school",
    summary: "Place, leadership, vision, mission, and values of Kapchorwa Senior Secondary School.",
    href: "/about",
  },
  {
    type: "page",
    title: "Academics",
    summary: "O-Level and A-Level pathways at Kapchorwa Senior Secondary School.",
    href: "/academics",
  },
  {
    type: "page",
    title: "Admissions",
    summary: "How to enquire about Senior 1 and Senior 5 admission to Kapchorwa Senior Secondary School.",
    href: "/admissions",
  },
  {
    type: "page",
    title: "Campus Life",
    summary: "The school day, sport, and student community at Kapchorwa Senior Secondary School.",
    href: "/campus-life",
  },
  {
    type: "page",
    title: "News",
    summary: "News and announcements connected with Kapchorwa Senior Secondary School.",
    href: "/news",
  },
  {
    type: "page",
    title: "Events",
    summary: "Published school calendar and events.",
    href: "/events",
  },
  {
    type: "page",
    title: "Downloads",
    summary: "Approved public documents from Kapchorwa Senior Secondary School.",
    href: "/downloads",
  },
  {
    type: "page",
    title: "Alumni and development",
    summary: "Former students and school development projects.",
    href: "/alumni",
  },
  {
    type: "page",
    title: "Contact",
    summary: "How to contact Kapchorwa Senior Secondary School in Kawowo, Kapchorwa Municipality.",
    href: "/contact",
  },
  {
    type: "page",
    title: "Privacy notice",
    summary: "How this website handles enquiry information and first-party analytics.",
    href: "/privacy",
  },
  {
    type: "page",
    title: "Support the school",
    summary: "Approved development projects and donation information for Kapchorwa Senior Secondary School.",
    href: "/support",
  },
  {
    type: "page",
    title: "School notices",
    summary: "Published notices and optional email subscriptions for parents and guardians.",
    href: "/parent-communications",
  },
];

function matches(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function searchPublishedContent(query: string, page = 1, pageSize = 12) {
  const q = query.trim();
  if (!q || q.length > 80) {
    return { items: [] as SearchHit[], total: 0, page: 1, pageCount: 1, pageSize };
  }

  const now = new Date();
  const published = {
    status: "published",
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };
  const db = getPrisma();
  let news: Array<{ title: string; summary: string; slug: string; status: string; publishedAt: Date | null }> = [];
  let events: Array<{ title: string; summary: string; slug: string; status: string; publishedAt: Date | null }> = [];
  let downloads: Array<{ id: string; title: string; description: string | null }> = [];
  let alumni: Array<{ title: string; summary: string; slug: string; status: string; publishedAt: Date | null }> = [];
  let projects: Array<{ title: string; summary: string; slug: string | null; id: string }> = [];

  if (db) {
    try {
      [news, events, downloads, alumni, projects] = await Promise.all([
        db.newsArticle.findMany({
          where: {
            ...published,
            OR: [{ title: { contains: q } }, { summary: { contains: q } }, { body: { contains: q } }],
          },
          select: { title: true, summary: true, slug: true, status: true, publishedAt: true },
          take: 40,
        }),
        db.eventItem.findMany({
          where: {
            ...published,
            cancelled: false,
            archived: false,
            audience: { not: "alumni" },
            OR: [{ title: { contains: q } }, { summary: { contains: q } }, { body: { contains: q } }, { location: { contains: q } }],
          },
          select: { title: true, summary: true, slug: true, status: true, publishedAt: true },
          take: 40,
        }),
        db.downloadItem.findMany({
          where: {
            status: "published",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            AND: [{ OR: [{ title: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }] }],
          },
          select: { id: true, title: true, description: true },
          take: 40,
        }),
        db.alumniStory.findMany({
          where: {
            ...published,
            OR: [{ title: { contains: q } }, { summary: { contains: q } }, { body: { contains: q } }, { personName: { contains: q } }],
          },
          select: { title: true, summary: true, slug: true, status: true, publishedAt: true },
          take: 40,
        }),
        db.developmentProject.findMany({
          where: {
            status: "published",
            OR: [{ title: { contains: q } }, { summary: { contains: q } }, { body: { contains: q } }, { publicUpdates: { contains: q } }],
          },
          select: { title: true, summary: true, slug: true, id: true },
          take: 40,
        }),
      ]);
    } catch {
      news = [];
      events = [];
      downloads = [];
      alumni = [];
      projects = [];
    }
  }

  const hits: SearchHit[] = [
    ...STATIC_PAGES.filter((pageItem) => matches(pageItem.title, q) || matches(pageItem.summary, q)),
    ...news
      .filter((item) => isPublished(item.status, item.publishedAt))
      .map((item) => ({
        type: "news" as const,
        title: item.title,
        summary: item.summary,
        href: `/news/${item.slug}`,
      })),
    ...events
      .filter((item) => isPublished(item.status, item.publishedAt))
      .map((item) => ({
        type: "event" as const,
        title: item.title,
        summary: item.summary,
        href: `/events/${item.slug}`,
      })),
    ...downloads.map((item) => ({
      type: "document" as const,
      title: item.title,
      summary: item.description || "Approved public document",
      href: `/downloads#${item.id}`,
    })),
    ...alumni
      .filter((item) => isPublished(item.status, item.publishedAt))
      .map((item) => ({
        type: "alumni" as const,
        title: item.title,
        summary: item.summary,
        href: `/alumni/${item.slug}`,
      })),
    ...projects.map((item) => ({
      type: "project" as const,
      title: item.title,
      summary: item.summary,
      href: item.slug ? `/support/projects/${item.slug}` : "/support",
    })),
  ];

  const total = hits.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    items: hits.slice((safePage - 1) * pageSize, safePage * pageSize),
    total,
    page: safePage,
    pageCount,
    pageSize,
  };
}
