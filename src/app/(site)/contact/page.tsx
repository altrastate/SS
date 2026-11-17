import { ContactForm } from "@/components/forms/EnquiryForm";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VerifyNotice } from "@/components/ui/states";
import { getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Contact",
    description:
      "Contact Kapchorwa Senior Secondary School in Kawowo, Kapchorwa Municipality. Send a general enquiry or confirm current office details with the school.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const mapQuery = encodeURIComponent(settings.mapQuery || settings.locationLine);
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}`;

  return (
    <>
      <PageHero
        eyebrow="Reach the school"
        title="Contact"
        description={settings.contactIntro || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/contact", label: "Contact" },
        ]}
      />

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div>
              <SectionHeading eyebrow="Location" title="Kapchorwa S.S." />
              <address className="mt-5 not-italic text-muted">
                <p>{settings.locationLine}</p>
                {settings.streetAddress ? <p className="mt-2">{settings.streetAddress}</p> : null}
                {settings.postalAddress ? <p className="mt-2">{settings.postalAddress}</p> : null}
              </address>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-navy">Currently published details</h2>
              <ul className="mt-4 space-y-2 text-muted">
                <li>
                  Email:{" "}
                  {settings.email ? (
                    <a className="text-navy underline" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  ) : (
                    "to be confirmed"
                  )}
                </li>
                <li>
                  Telephone:{" "}
                  {settings.phone ? (
                    <a className="text-navy underline" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                      {settings.phone}
                    </a>
                  ) : (
                    "to be confirmed"
                  )}
                </li>
                {settings.secondaryPhone ? <li>Additional number: {settings.secondaryPhone}</li> : null}
                <li>Office hours: {settings.officeHours}</li>
              </ul>
              {!settings.contactDetailsVerified ? (
                <div className="mt-4">
                  <VerifyNotice>
                    These contact details are drawn from currently published school sources and should be
                    confirmed with the school office before use for urgent or financial matters.
                  </VerifyNotice>
                </div>
              ) : null}
            </div>
            <div>
              <h2 className="font-serif text-2xl text-navy">Directions</h2>
              <p className="mt-3 text-muted">
                The campus is in Kawowo, Central Division, Kapchorwa Municipality. Ask for Kapchorwa
                Senior Secondary School, or for Kapchorwa Secondary School, P.O. Box 114.
              </p>
              <a className="mt-4 inline-flex min-h-11 items-center font-semibold text-navy underline" href={mapUrl}>
                Open a map search for Kapchorwa Senior Secondary School
              </a>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-navy">Department contacts</h2>
              <p className="mt-3 text-muted">
                Named departmental telephone numbers and email addresses will be listed after the school
                supplies an approved directory.
              </p>
            </div>
          </div>
          <div className="border border-navy/10 bg-white p-6 sm:p-8">
            <SectionHeading
              eyebrow="Enquiry"
              title="Write to the school"
              description="Use this form for a general enquiry. Do not include private student records."
            />
            <div className="mt-6">
              <ContactForm />
            </div>
            <p className="mt-6 text-sm text-muted">
              Submitted information is used only to respond to the enquiry, as described in the{" "}
              <a className="underline" href="/privacy">
                privacy notice
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
