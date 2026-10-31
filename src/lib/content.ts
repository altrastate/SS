import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { isPublished } from "@/lib/utils";

export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: DEFAULT_SETTINGS });
}

export async function getPublishedNews(options?: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;
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
    prisma.newsArticle.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsArticle.count({ where }),
    prisma.newsArticle.findMany({
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
}

export async function getLatestNews(limit = 3) {
  return prisma.newsArticle.findMany({
    where: {
      status: "published",
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getNewsBySlug(slug: string) {
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article || !isPublished(article.status, article.publishedAt)) return null;
  return article;
}

export async function getRelatedNews(slug: string, category: string, limit = 3) {
  return prisma.newsArticle.findMany({
    where: {
      slug: { not: slug },
      category,
      status: "published",
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedEvents(options?: { category?: string }) {
  const now = new Date();
  return prisma.eventItem.findMany({
    where: {
      status: "published",
      archived: false,
      audience: { not: "alumni" },
      AND: [{ OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }],
      ...(options?.category ? { category: options.category } : {}),
    },
    orderBy: [{ startAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function getUpcomingEvents(limit = 6) {
  const now = new Date();
  return prisma.eventItem.findMany({
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
  });
}

export async function getPastEvents(limit = 12) {
  const now = new Date();
  return prisma.eventItem.findMany({
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
  });
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.eventItem.findUnique({ where: { slug } });
  if (!event || event.archived || event.audience === "alumni" || !isPublished(event.status, event.publishedAt)) return null;
  return event;
}

export async function getAlumniPortalEvents() {
  const now = new Date();
  return prisma.eventItem.findMany({
    where: {
      status: "published",
      archived: false,
      audience: { in: ["alumni", "both"] },
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getAlumniBySlug(slug: string) {
  const story = await prisma.alumniStory.findUnique({ where: { slug } });
  if (!story || !isPublished(story.status, story.publishedAt)) return null;
  return story;
}

export async function getProjectBySlug(slug: string) {
  const project = await prisma.developmentProject.findUnique({ where: { slug } });
  if (!project || project.status !== "published") return null;
  return project;
}

export async function getPathways() {
  return prisma.academicPathway.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getDepartments() {
  return prisma.academicDepartment.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getGallery(limit?: number) {
  return prisma.galleryItem.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export async function getStaff(category?: string) {
  return prisma.staffProfile.findMany({
    where: {
      status: "published",
      ...(category ? { category } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAlumniStories() {
  return prisma.alumniStory.findMany({
    where: {
      status: "published",
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getProjects() {
  return prisma.developmentProject.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getDownloads(category?: string, query?: string) {
  const now = new Date();
  return prisma.downloadItem.findMany({
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
  });
}

export async function getPublishedDownload(id: string) {
  const now = new Date();
  const item = await prisma.downloadItem.findUnique({ where: { id } });
  if (!item || item.status !== "published") return null;
  if (item.expiresAt && item.expiresAt.getTime() <= now.getTime()) return null;
  return item;
}

export async function getFaqs(category?: string) {
  return prisma.fAQ.findMany({
    where: {
      status: "published",
      ...(category ? { category } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTimeline() {
  return prisma.timelineEvent.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCampusSections() {
  return prisma.campusLifeSection.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getEnquiryCounts() {
  const [total, unread, awaiting] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.enquiry.count({ where: { status: { in: ["new", "in_progress", "read"] } } }),
  ]);
  return { total, unread, awaiting };
}

export async function getDashboardStats() {
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
    prisma.newsArticle.count({ where: { status: "published" } }),
    prisma.newsArticle.count({ where: { status: "draft" } }),
    prisma.newsArticle.count({ where: { status: { in: ["draft", "review"] } } }),
    prisma.newsArticle.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.eventItem.findMany({
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
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.enquiry.count({ where: { status: { in: ["new", "in_progress", "read"] } } }),
    prisma.eventItem.count({ where: { status: "published", archived: false } }),
    prisma.alumniStory.count({ where: { status: "published" } }),
    prisma.developmentProject.count({ where: { status: "published" } }),
    prisma.downloadItem.count({ where: { status: "published" } }),
    prisma.academicPathway.count({ where: { status: "published" } }),
    prisma.campusLifeSection.count({ where: { status: "published" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, action: true, resourceType: true, summary: true, actorEmail: true, createdAt: true },
    }),
    prisma.eventItem.count({ where: { status: { in: ["draft", "review"] } } }),
    prisma.alumniStory.count({ where: { status: { in: ["draft", "review"] } } }),
    prisma.developmentProject.count({ where: { status: { in: ["draft", "review"] } } }),
    prisma.downloadItem.count({ where: { status: { in: ["draft", "review"] } } }),
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
}
