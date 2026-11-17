import type { Metadata } from "next";
import { SCHOOL_CREST } from "@/lib/site-media";
import { absoluteUrl, siteUrl } from "@/lib/utils";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || SCHOOL_CREST);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Kapchorwa Senior Secondary School",
      locale: "en_UG",
      images: [{ url: ogImage, alt: "Kapchorwa Senior Secondary School" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function organizationJsonLd(settings: {
  schoolName: string;
  motto: string;
  locationLine: string;
  email: string | null;
  phone: string | null;
  foundingYear: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: settings.schoolName,
    alternateName: ["Kapchorwa S.S.", "Kapchorwa SS", "KSS"],
    motto: settings.motto,
    ...(settings.foundingYear >= 1900 ? { foundingDate: String(settings.foundingYear) } : {}),
    url: siteUrl(),
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kawowo, Central Division",
      addressLocality: "Kapchorwa Municipality",
      addressRegion: "Kapchorwa District",
      postalCode: "P.O. Box 114",
      addressCountry: "UG",
    },
    description: settings.locationLine,
  };
}
