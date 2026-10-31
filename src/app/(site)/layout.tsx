import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { Cinematics } from "@/components/home/Cinematics";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSiteSettings } from "@/lib/content";
import { organizationJsonLd } from "@/lib/seo";
import "./jico.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="jico-site flex min-h-full flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Cinematics />
      {settings.announcementEnabled && settings.announcementText ? (
        <AnnouncementBar text={settings.announcementText} href={settings.announcementHref} />
      ) : null}
      <SiteHeader schoolName={settings.schoolName} motto={settings.motto} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
      />
      {settings.analyticsEnabled !== false ? <AnalyticsBeacon /> : null}
    </div>
  );
}
