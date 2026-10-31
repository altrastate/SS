import type { MetadataRoute } from "next";
import { getAlumniStories, getPublishedEvents, getPublishedNews, getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ items }, events, alumni, projects] = await Promise.all([
    getPublishedNews({ pageSize: 100 }),
    getPublishedEvents(),
    getAlumniStories(),
    getProjects(),
  ]);
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/academics",
    "/admissions",
    "/campus-life",
    "/news",
    "/events",
    "/downloads",
    "/search",
    "/alumni",
    "/support",
    "/support/donate",
    "/parent-communications",
    "/contact",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const newsRoutes = items.map((article) => ({
    url: `${base}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const eventRoutes = events.map((event) => ({
    url: `${base}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const alumniRoutes = [
    ...alumni.map((story) => ({
      url: `${base}/alumni/${story.slug}`,
      lastModified: story.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...projects
      .filter((project) => project.slug)
      .map((project) => ({
        url: `${base}/support/projects/${project.slug}`,
        lastModified: project.updatedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];

  return [...staticRoutes, ...newsRoutes, ...eventRoutes, ...alumniRoutes];
}
