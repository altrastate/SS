import type { PrismaClient } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import {
  STATIC_CAMPUS,
  STATIC_FAQS,
  STATIC_GALLERY,
  STATIC_PATHWAYS,
  STATIC_STAFF,
  STATIC_TIMELINE,
  staticSiteSettings,
} from "@/lib/static-content";
import { isPublished } from "@/lib/utils";

async function fromDb<T>(fn: (db: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  const db = getPrisma();
  if (!db) return fallback;
  try {
    return await fn(db);
  } catch {
    return fallback;
  }
}

export async function getSiteSettings() {
  return fromDb(async (db) => {
    const existing = await db.siteSettings.findUnique({ where: { id: "default" } });
    if (existing) return existing;
    return db.siteSettings.create({ data: DEFAULT_SETTINGS });
  }, staticSiteSettings());
}

export async function getPublishedNews(options?: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;
  const empty = {
    items: [],
    total: 0,
    page,
    pageSize,
    pageCount: 1,
    categories: [] as string[],
  };

  return fromDb(async (db) => {
    const where = {
      status: "published",
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      ...(options?.category ? { category: options.category } : {}),
      ...(options?.query
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: options.query } },
                  { summary: { contains: options.query } },
                  { body: { contains: options.query } },
                ],
              },
            ],
          }
        : {}),
    };

    const [items, total, categories] = await Promise.all([
      db.newsArticle.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.newsArticle.count({ where }),
      db.newsArticle.findMany({
        where: { status: "published" },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      categories: categories.map((item) => item.category).sort(),
    };
  }, empty);
}

export async function getLatestNews(limit = 3) {
  return fromDb(
    (db) =>
      db.newsArticle.findMany({
        where: {
          status: "published",
          OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        take: limit,
      }),
    [],
  );
}

export async function getNewsBySlug(slug: string) {
  return fromDb(async (db) => {
    const article = await db.newsArticle.findUnique({ where: { slug } });
    if (!article || !isPublished(article.status, article.publishedAt)) return null;
    return article;
  }, null);
}

export async function getRelatedNews(slug: string, category: string, limit = 3) {
  return fromDb(
    (db) =>
      db.newsArticle.findMany({
        where: {
          slug: { not: slug },
          category,
          status: "published",
          OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
        },
        orderBy: [{ publishedAt: "desc" }],
        take: limit,
      }),
    [],
  );
}

export async function getPublishedEvents(options?: { category?: string }) {
  const now = new Date();
  return fromDb(
    (db) =>
      db.eventItem.findMany({
        where: {
          status: "published",
          archived: false,
          audience: { not: "alumni" },
          AND: [{ OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }],
          ...(options?.category ? { category: options.category } : {}),
        },
        orderBy: [{ startAt: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getUpcomingEvents(limit = 6) {
  const now = new Date();
  return fromDb(
    (db) =>
      db.eventItem.findMany({
        where: {
          status: "published",
          archived: false,
          cancelled: false,
          audience: { not: "alumni" },
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
          AND: [{ OR: [{ startAt: { gte: now } }, { endAt: { gte: now } }] }],
        },
        orderBy: { startAt: "asc" },
        take: limit,
      }),
    [],
  );
}

export async function getPastEvents(limit = 12) {
  const now = new Date();
  return fromDb(
    (db) =>
      db.eventItem.findMany({
        where: {
          status: "published",
          archived: false,
          audience: { not: "alumni" },
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
          startAt: { lt: now },
          AND: [{ OR: [{ endAt: null }, { endAt: { lt: now } }] }],
        },
        orderBy: { startAt: "desc" },
        take: limit,
      }),
    [],
  );
}

export async function getEventBySlug(slug: string) {
  return fromDb(async (db) => {
    const event = await db.eventItem.findUnique({ where: { slug } });
    if (!event || event.archived || event.audience === "alumni" || !isPublished(event.status, event.publishedAt)) {
      return null;
    }
    return event;
  }, null);
}

export async function getAlumniPortalEvents() {
  const now = new Date();
  return fromDb(
    (db) =>
      db.eventItem.findMany({
        where: {
          status: "published",
          archived: false,
          audience: { in: ["alumni", "both"] },
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
        },
        orderBy: { startAt: "asc" },
      }),
    [],
  );
}

export async function getAlumniBySlug(slug: string) {
  return fromDb(async (db) => {
    const story = await db.alumniStory.findUnique({ where: { slug } });
    if (!story || !isPublished(story.status, story.publishedAt)) return null;
    return story;
  }, null);
}

export async function getProjectBySlug(slug: string) {
  return fromDb(async (db) => {
    const project = await db.developmentProject.findUnique({ where: { slug } });
    if (!project || project.status !== "published") return null;
    return project;
  }, null);
}

export async function getPathways() {
  return fromDb(
    (db) =>
      db.academicPathway.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      }),
    STATIC_PATHWAYS,
  );
}

export async function getDepartments() {
  return fromDb(
    (db) =>
      db.academicDepartment.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      }),
    [],
  );
}

export async function getGallery(limit?: number) {
  return fromDb(
    (db) =>
      db.galleryItem.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
        take: limit,
      }),
    STATIC_GALLERY.slice(0, limit),
  );
}

export async function getStaff(category?: string) {
  const fallback = category ? STATIC_STAFF.filter((item) => item.category === category) : STATIC_STAFF;
  return fromDb(
    (db) =>
      db.staffProfile.findMany({
        where: {
          status: "published",
          ...(category ? { category } : {}),
        },
        orderBy: { sortOrder: "asc" },
      }),
    fallback,
  );
}

export async function getAlumniStories() {
  return fromDb(
    (db) =>
      db.alumniStory.findMany({
        where: {
          status: "published",
          OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getProjects() {
  return fromDb(
    (db) =>
      db.developmentProject.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      }),
    [],
  );
}

export async function getDownloads(category?: string, query?: string) {
  const now = new Date();
  return fromDb(
    (db) =>
      db.downloadItem.findMany({
        where: {
          status: "published",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          ...(category ? { category: category } : {}),
          ...(query
            ? {
                AND: [
                  {
                    OR: [{ title: { contains: query } }, { description: { contains: query } }],
                  },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );
}

export async function getPublishedDownload(id: string) {
  const now = new Date();
  return fromDb(async (db) => {
    const item = await db.downloadItem.findUnique({ where: { id } });
    if (!item || item.status !== "published") return null;
    if (item.expiresAt && item.expiresAt.getTime() <= now.getTime()) return null;
    return item;
  }, null);
}

export async function getFaqs(category?: string) {
  const fallback = category ? STATIC_FAQS.filter((item) => item.category === category) : STATIC_FAQS;
  return fromDb(
    (db) =>
      db.fAQ.findMany({
        where: {
          status: "published",
          ...(category ? { category } : {}),
        },
        orderBy: { sortOrder: "asc" },
      }),
    fallback,
  );
}

export async function getTimeline() {
  return fromDb(
    (db) =>
      db.timelineEvent.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      }),
    STATIC_TIMELINE,
  );
}

export async function getCampusSections() {
  return fromDb(
    (db) =>
      db.campusLifeSection.findMany({
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      }),
    STATIC_CAMPUS,
  );
}

export async function getEnquiryCounts() {
  return fromDb(
    async (db) => {
      const [total, unread, awaiting] = await Promise.all([
        db.enquiry.count(),
        db.enquiry.count({ where: { status: "new" } }),
        db.enquiry.count({ where: { status: { in: ["new", "in_progress", "read"] } } }),
      ]);
      return { total, unread, awaiting };
    },
    { total: 0, unread: 0, awaiting: 0 },
  );
}

export async function getDashboardStats() {
  const empty = {
    publishedPages: 11,
    publishedNews: 0,
    draftNews: 0,
    reviewNews: 0,
    draftContent: 0,
    recentNews: [],
    upcomingEvents: [],
    newEnquiries: 0,
    awaitingEnquiries: 0,
    publishedProjects: 0,
    recentAudit: [],
  };

  return fromDb(async (db) => {
    const now = new Date();
    const [
      publishedNews,
      draftNews,
      reviewNews,
      recentNews,
      upcomingEvents,
      newEnquiries,
      awaitingEnquiries,
      publishedEvents,
      publishedAlumni,
      publishedProjects,
      publishedDownloads,
      publishedPathways,
      publishedCampus,
      recentAudit,
      draftEvents,
      draftAlumni,
      draftProjects,
      draftDownloads,
    ] = await Promise.all([
      db.newsArticle.count({ where: { status: "published" } }),
      db.newsArticle.count({ where: { status: "draft" } }),
      db.newsArticle.count({ where: { status: { in: ["draft", "review"] } } }),
      db.newsArticle.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      db.eventItem.findMany({
        where: {
          status: "published",
          archived: false,
          cancelled: false,
          OR: [{ startAt: { gte: now } }, { endAt: { gte: now } }],
        },
        orderBy: { startAt: "asc" },
        take: 5,
        select: { id: true, title: true, startAt: true, location: true, cancelled: true },
      }),
      db.enquiry.count({ where: { status: "new" } }),
      db.enquiry.count({ where: { status: { in: ["new", "in_progress", "read"] } } }),
      db.eventItem.count({ where: { status: "published", archived: false } }),
      db.alumniStory.count({ where: { status: "published" } }),
      db.developmentProject.count({ where: { status: "published" } }),
      db.downloadItem.count({ where: { status: "published" } }),
      db.academicPathway.count({ where: { status: "published" } }),
      db.campusLifeSection.count({ where: { status: "published" } }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, action: true, resourceType: true, summary: true, actorEmail: true, createdAt: true },
      }),
      db.eventItem.count({ where: { status: { in: ["draft", "review"] } } }),
      db.alumniStory.count({ where: { status: { in: ["draft", "review"] } } }),
      db.developmentProject.count({ where: { status: { in: ["draft", "review"] } } }),
      db.downloadItem.count({ where: { status: { in: ["draft", "review"] } } }),
    ]);

    const staticPages = 11;
    const publishedPages =
      staticPages + publishedNews + publishedEvents + publishedAlumni + publishedDownloads + publishedPathways + publishedCampus;
    const draftContent = reviewNews + draftEvents + draftAlumni + draftProjects + draftDownloads;

    return {
      publishedPages,
      publishedNews,
      draftNews,
      reviewNews,
      draftContent,
      recentNews,
      upcomingEvents,
      newEnquiries,
      awaitingEnquiries,
      publishedProjects,
      recentAudit,
    };
  }, empty);
}
