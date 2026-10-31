import { saveSettings } from "@/app/actions/admin";
import { AdminTitle, Field } from "@/app/admin/_ui";
import { getSiteSettings } from "@/lib/content";
import { requirePermission } from "@/lib/guard";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePermission("settings");
  const settings = await getSiteSettings();
  const { saved } = await searchParams;

  return (
    <>
      <AdminTitle
        title="Site settings"
        description="School identity, contact details, announcements, and page introductions. Leave unverified facts unpublished or clearly marked."
      />
      {saved ? (
        <p className="mb-6 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          Settings saved.
        </p>
      ) : null}
      <form action={saveSettings} className="grid gap-8 lg:grid-cols-2">
        <section className="border border-navy/10 bg-white p-5">
          <h2 className="mb-4 font-serif text-2xl text-navy">Identity</h2>
          <Field label="School name" name="schoolName" defaultValue={settings.schoolName} required />
          <Field label="Abbreviation" name="abbreviation" defaultValue={settings.abbreviation} />
          <Field label="Motto" name="motto" defaultValue={settings.motto} required />
          <Field label="Tagline" name="tagline" defaultValue={settings.tagline} />
          <Field label="Founding year" name="foundingYear" type="number" defaultValue={settings.foundingYear} />
        </section>
        <section className="border border-navy/10 bg-white p-5">
          <h2 className="mb-4 font-serif text-2xl text-navy">Contact</h2>
          <Field label="Location line" name="locationLine" defaultValue={settings.locationLine} required />
          <Field label="Street address" name="streetAddress" defaultValue={settings.streetAddress} />
          <Field label="Postal address" name="postalAddress" defaultValue={settings.postalAddress} />
          <Field label="Email" name="email" defaultValue={settings.email} />
          <Field label="Telephone" name="phone" defaultValue={settings.phone} />
          <Field label="Additional telephone" name="secondaryPhone" defaultValue={settings.secondaryPhone} />
          <Field label="Office hours" name="officeHours" defaultValue={settings.officeHours} />
          <Field label="Map search query" name="mapQuery" defaultValue={settings.mapQuery} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="contactDetailsVerified" defaultChecked={settings.contactDetailsVerified} />
            Contact details have been verified by the school
          </label>
        </section>
        <section className="border border-navy/10 bg-white p-5">
          <h2 className="mb-4 font-serif text-2xl text-navy">Announcement bar</h2>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="announcementEnabled" defaultChecked={settings.announcementEnabled} />
            Show announcement bar
          </label>
          <Field label="Announcement text" name="announcementText" defaultValue={settings.announcementText} />
          <Field label="Announcement link" name="announcementHref" defaultValue={settings.announcementHref} />
        </section>
        <section className="border border-navy/10 bg-white p-5">
          <h2 className="mb-4 font-serif text-2xl text-navy">Search and sharing</h2>
          <Field label="Meta title" name="metaTitle" defaultValue={settings.metaTitle} />
          <Field label="Meta description" name="metaDescription" textarea rows={4} defaultValue={settings.metaDescription} />
          <Field label="Developer name" name="developerName" defaultValue={settings.developerName} />
          <Field label="Developer URL" name="developerUrl" defaultValue={settings.developerUrl} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="developerAttributionEnabled"
              defaultChecked={settings.developerAttributionEnabled}
            />
            Show discreet developer attribution in the footer
          </label>
        </section>
        <section className="border border-navy/10 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-serif text-2xl text-navy">Page introductions</h2>
          <Field label="Homepage introduction" name="introText" textarea defaultValue={settings.introText} />
          <Field label="About overview" name="aboutOverview" textarea defaultValue={settings.aboutOverview} />
          <Field label="History text" name="historyText" textarea defaultValue={settings.historyText} />
          <Field label="Vision" name="vision" textarea rows={3} defaultValue={settings.vision} />
          <Field label="Mission" name="mission" textarea rows={3} defaultValue={settings.mission} />
          <Field label="Inspiration" name="inspiration" defaultValue={settings.inspiration} />
          <Field
            label="Values JSON"
            name="valuesJson"
            textarea
            rows={8}
            defaultValue={settings.valuesJson}
            hint='Array of {"title","body"} objects.'
          />
          <Field label="Academics introduction" name="academicsIntro" textarea defaultValue={settings.academicsIntro} />
          <Field label="Campus introduction" name="campusIntro" textarea defaultValue={settings.campusIntro} />
          <Field label="Admissions introduction" name="admissionsIntro" textarea defaultValue={settings.admissionsIntro} />
          <Field label="Fees notice" name="feesNotice" textarea defaultValue={settings.feesNotice} />
          <Field label="Payment notice" name="paymentNotice" textarea defaultValue={settings.paymentNotice} />
          <Field label="Fraud-prevention notice" name="fraudNotice" textarea defaultValue={settings.fraudNotice} />
          <Field label="Contact introduction" name="contactIntro" textarea defaultValue={settings.contactIntro} />
          <Field label="Alumni introduction" name="alumniIntro" textarea defaultValue={settings.alumniIntro} />
          <Field label="JICOBA introduction" name="jicobaIntro" textarea defaultValue={settings.jicobaIntro} />
          <Field label="Development introduction" name="developmentIntro" textarea defaultValue={settings.developmentIntro} />
        </section>
        <section className="border border-navy/10 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-serif text-2xl text-navy">Head Teacher</h2>
          <Field label="Title" name="headTeacherTitle" defaultValue={settings.headTeacherTitle} />
          <Field label="Name" name="headTeacherName" defaultValue={settings.headTeacherName} hint="Leave empty until confirmed." />
          <Field label="Photograph URL" name="headTeacherPhotoUrl" defaultValue={settings.headTeacherPhotoUrl} />
          <Field label="Quote" name="headTeacherQuote" textarea defaultValue={settings.headTeacherQuote} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="headTeacherNamePending" defaultChecked={settings.headTeacherNamePending} />
            Name is pending confirmation
          </label>
        </section>
        <section className="border border-navy/10 bg-white p-5">
          <h2 className="mb-4 font-serif text-2xl text-navy">Operations</h2>
          <Field
            label="Enquiry retention (days)"
            name="enquiryRetentionDays"
            type="number"
            defaultValue={settings.enquiryRetentionDays}
            hint="Authorised staff should delete records that are no longer needed. Default 365 days is a working guideline pending school legal review."
          />
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="analyticsEnabled" defaultChecked={settings.analyticsEnabled} />
            Record privacy-conscious first-party page views
          </label>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="alumniPortalEnabled" defaultChecked={settings.alumniPortalEnabled} />
            Enable alumni portal accounts
          </label>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="donationsEnabled" defaultChecked={settings.donationsEnabled} />
            Show public support pages (online payment still needs a configured provider)
          </label>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="communicationsEnabled" defaultChecked={settings.communicationsEnabled} />
            Enable notice subscriptions
          </label>
          <Field label="Support page introduction" name="supportIntro" textarea rows={4} defaultValue={settings.supportIntro} />
          <Field label="Parent communications introduction" name="parentCommsIntro" textarea rows={4} defaultValue={settings.parentCommsIntro} />
        </section>
        <div className="lg:col-span-2">
          <button type="submit" className="min-h-11 bg-navy px-5 text-sm font-semibold text-white">
            Save settings
          </button>
        </div>
      </form>
    </>
  );
}
