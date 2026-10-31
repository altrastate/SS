import Link from "next/link";
import { footerNav } from "@/lib/nav";
import { SCHOOL_CREST } from "@/lib/site-media";

type Settings = {
  schoolName: string;
  motto: string;
  locationLine: string;
  email: string | null;
  phone: string | null;
  postalAddress: string | null;
  officeHours?: string | null;
  contactDetailsVerified: boolean;
  developerAttributionEnabled: boolean;
  developerName: string;
  developerUrl: string | null;
};

export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="jico-foot">
      <div className="jico-brand">
        <img src={SCHOOL_CREST} alt="" width={46} height={46} />
        <span>
          <b>{settings.schoolName}</b>
          <small>
            {settings.motto} · Est. 1946
          </small>
        </span>
      </div>
      <p>
        © {year} {settings.schoolName} (JICO). All rights reserved.
        {settings.developerAttributionEnabled ? (
          <>
            {" "}
            {settings.developerUrl ? (
              <a href={settings.developerUrl}>Website by {settings.developerName}</a>
            ) : (
              <span>Website by {settings.developerName}</span>
            )}
          </>
        ) : null}
      </p>
      <nav className="more-links" aria-label="Footer">
        {footerNav.slice(0, 8).map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/privacy">Privacy</Link>
        <a className="top" href="#home">
          Back to top ↑
        </a>
      </nav>
    </footer>
  );
}
