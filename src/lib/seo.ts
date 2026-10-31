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
      siteName: "Jinja College",
      locale: "en_UG",
      images: [{ url: ogImage, alt: "Jinja College" }],
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
    alternateName: "JICO",
    motto: settings.motto,
    foundingDate: String(settings.foundingYear),
    url: siteUrl(),
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rubaga Hill",
      addressLocality: "Jinja City",
      addressCountry: "UG",
    },
    description: settings.locationLine,
  };
}
