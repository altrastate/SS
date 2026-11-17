import { PageHero } from "@/components/ui/PageHero";
import { VerifyNotice } from "@/components/ui/states";
import { getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Privacy Notice",
    description:
      "How Kapchorwa Senior Secondary School handles information submitted through this website, including enquiry forms.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Your information"
        title="Privacy notice"
        description="This notice explains how the Kapchorwa Senior Secondary School website handles information submitted through public forms. It is a practical template and is not a claim of legal certification."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />

      <article className="py-16">
        <div className="container-narrow prose-jico text-muted">
          <VerifyNotice>
            School-specific legal, retention, and data-protection details marked below require review by
            the college before this notice is treated as a final policy.
          </VerifyNotice>

          <h2>Who we are</h2>
          <p>
            This website is the public website of {settings.schoolName}, {settings.locationLine}. Website
            development is associated with {settings.developerName}.
          </p>

          <h2>What information website forms collect</h2>
          <p>
            The contact and admissions enquiry forms collect your name, an email address or telephone
            number, an enquiry category, and a message. They also record your confirmation that the
            school may use the information to reply. A technical identifier derived from the connection
            may be stored to help prevent spam.
          </p>
          <p>
            The forms do not ask for examination records, medical information, disciplinary history, or
            other sensitive student data. Please do not include those details in a message.
          </p>

          <h2>Why information is collected</h2>
          <p>
            Enquiries are collected so the school can respond to questions about the college, admissions,
            visits, alumni matters, and similar public requests.
          </p>

          <h2>How enquiries are handled</h2>
          <p>
            Submitted enquiries are stored for authorised school staff to review in the website’s
            administration area. If email notification has been configured, a copy may also be sent to a
            school mailbox. Confirmation is shown on the website only after the enquiry has been
            recorded.
          </p>

          <h2>Data retention and deletion</h2>
          <p>
            Enquiry records are kept for as long as they are needed to answer the request and to keep a
            modest administrative history. The working guideline in the content manager is{" "}
            {settings.enquiryRetentionDays || 365} days, after which authorised staff should review and
            delete records that are no longer needed.{" "}
            <strong>Retention periods require school legal review.</strong> Authorised staff can delete
            records from the administration area. Internal notes stay with the private enquiry record and
            are never published.
          </p>

          <h2>Alumni portal accounts</h2>
          <p>
            If the college enables the alumni portal, an account stores a name, email address, hashed password,
            optional graduation year, optional professional notes, and communication preferences. Profiles are
            private by default. A story is reviewed by staff before it can appear on the public website. Alumni
            accounts do not provide access to student records or school administration.
          </p>

          <h2>Notice subscriptions</h2>
          <p>
            Optional notice emails are sent only after explicit opt-in and email confirmation. The website stores
            the address, chosen categories, consent time, verification time, and unsubscribe time. Subscriber lists
            are not published and are not written to analytics. An unsubscribe link is included in subscription
            messages.
          </p>

          <h2>Donations</h2>
          <p>
            Online donations are offered only if the college enables the support pages and configures an approved
            payment provider. This website never stores card numbers, mobile-money PINs, or payment secrets. A
            receipt is issued only after the provider confirms payment.
          </p>

          <h2>Website analytics</h2>
          <p>
            This website may record first-party, aggregate activity such as page views, published search
            terms, document download counts, and form completion counts. It does not use a third-party
            analytics cookie, and it does not store enquiry message content, student records, or
            authentication details in analytics. Search terms that look like email addresses or telephone
            numbers are not stored.
          </p>

          <h2>Who can access submitted information</h2>
          <p>
            Access is limited to authorised website administrators and the school staff they designate.
            The information is not published on the public website.
          </p>

          <h2>How to contact the school about privacy</h2>
          <p>
            To ask a question about this notice, or to request correction or deletion of an enquiry you
            submitted, contact the college using the details on the{" "}
            <a href="/contact">contact page</a>
            {settings.email ? (
              <>
                {" "}
                or email{" "}
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </>
            ) : null}
            . <strong>A named data-protection contact still requires school confirmation.</strong>
          </p>

          {settings.privacyBody ? <p>{settings.privacyBody}</p> : null}
        </div>
      </article>
    </>
  );
}
