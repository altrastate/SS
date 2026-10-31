import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/downloads/file/", "/alumni/portal", "/alumni/portal/", "/support/receipt/", "/support/donate/return"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
