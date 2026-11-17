import { AdmissionEnquiryForm } from "@/components/forms/EnquiryForm";
import { FeatureCard } from "@/components/ui/cards";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { getFaqs, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Admissions",
    description:
      "Admission information for Kapchorwa Senior Secondary School. Contact the school for the latest requirements, vacancies, and fee structure.",
    path: "/admissions",
  });
}

export default async function AdmissionsPage() {
  const [settings, faqs] = await Promise.all([getSiteSettings(), getFaqs("admissions")]);
  const generalFaqs = await getFaqs("general");
  const admissionFaqs = faqs.length ? faqs : generalFaqs;

  return (
    <>
      <PageHero
        eyebrow="Join the school"
        title="Admissions"
        description={settings.admissionsIntro || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/admissions", label: "Admissions" },
        ]}
      />

      <section className="py-16">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <FeatureCard
            title="Senior 1 admission"
            description="Currently published college guidance states that O-Level admission is based on Primary Leaving Examination performance. Entrance interviews may also apply. Contact the school for the latest admission information."
          />
          <FeatureCard
            title="Senior 5 admission"
            description="Currently published college guidance states that A-Level admission is based on Uganda Certificate of Education results. Entrance interviews may also apply. Contact the school for current vacancies and requirements."
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Documents"
              title="Required documents"
              description="A verified document list has not been published here. Families should ask the school office which documents are required for the current intake."
            />
            <div className="mt-8">
              <EmptyState
                title="Document checklist awaiting confirmation"
                description="Official information will be published after confirmation."
              />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Fees" title="Current fees information" />
            <p className="mt-5 text-muted">{settings.feesNotice}</p>
            <div className="mt-6">
              <VerifyNotice>{settings.paymentNotice}</VerifyNotice>
            </div>
            <p className="mt-6 text-sm text-danger">{settings.fraudNotice}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Questions" title="Admissions frequently asked questions" />
          <div className="mt-8">
            {admissionFaqs.length ? (
              <FAQAccordion items={admissionFaqs} />
            ) : (
              <EmptyState
                title="No FAQs published"
                description="Approved questions and answers can be added from the content manager."
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Enquiry"
              title="Ask the school about admission"
              description="This form sends a general enquiry. It is not an application portal and does not reserve a place."
            />
            <p className="mt-4 text-sm text-muted">
              Do not include examination index numbers, medical details, or other sensitive student
              records in this form.
            </p>
          </div>
          <div className="border border-navy/10 bg-ivory p-6 sm:p-8">
            <AdmissionEnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
