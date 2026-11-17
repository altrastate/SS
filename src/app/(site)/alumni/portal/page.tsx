import { logoutAlumni, requestAlumniDeletion, submitAlumniStory, updateAlumniProfile } from "@/app/actions/alumni";
import { EventInterestForm } from "@/components/comms/EventInterestForm";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { getAlumniSession } from "@/lib/alumni-auth";
import { getAlumniPortalEvents } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { formatSchoolDateTime } from "@/lib/timezone";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return pageMetadata({ title: "Alumni portal", description: "Private Kapchorwa Senior Secondary School alumni account.", path: "/alumni/portal", noIndex: true });
}

export default async function AlumniPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; story?: string; deleted?: string; error?: string; interest?: string }>;
}) {
  const flags = await getModuleFlags();
  if (!flags.alumniPortal) {
    return (
      <>
        <PageHero title="Alumni portal" description="This service is waiting for the college to enable it." crumbs={[{ href: "/", label: "Home" }, { href: "/alumni", label: "Alumni" }]} />
        <section className="py-16"><div className="container-narrow"><VerifyNotice>Alumni accounts are not active yet.</VerifyNotice></div></section>
      </>
    );
  }
  const session = await getAlumniSession();
  if (!session) redirect("/alumni/portal/login");
  const params = await searchParams;
  const account = await prisma.alumniAccount.findUnique({ where: { id: session.sub } });
  if (!account) redirect("/alumni/portal/login");
  const [stories, events] = await Promise.all([
    prisma.alumniStory.findMany({ where: { submittedById: account.id }, orderBy: { createdAt: "desc" } }),
    getAlumniPortalEvents(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Private account"
        title={`Welcome, ${account.name}`}
        description="Your profile is not public unless you give explicit consent. Staff review stories before they appear on the website."
        crumbs={[{ href: "/", label: "Home" }, { href: "/alumni", label: "Alumni" }, { href: "/alumni/portal", label: "Portal" }]}
      />
      <section className="py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="border border-navy/10 bg-white p-6">
            {params.saved ? <p className="mb-4 text-sm text-ok">Profile saved.</p> : null}
            {params.deleted ? <p className="mb-4 text-sm text-ok">Deletion has been requested. A staff member will complete it.</p> : null}
            <h2 className="font-serif text-2xl text-navy">Profile</h2>
            <form action={updateAlumniProfile} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold">Name<input name="name" defaultValue={account.name} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" /></label>
              <p className="text-sm text-muted">{account.email}</p>
              <label className="block text-sm font-semibold">Graduation year<input name="graduationYear" defaultValue={account.graduationYear || ""} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" /></label>
              <label className="block text-sm font-semibold">Profession or mentorship area<input name="profession" defaultValue={account.profession || ""} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" /></label>
              <label className="flex gap-2 text-sm"><input type="checkbox" name="mentorshipInterest" defaultChecked={account.mentorshipInterest} /> Interested in mentoring</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" name="supportInterest" defaultChecked={account.supportInterest} /> Interested in supporting school initiatives</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" name="publicProfileConsent" defaultChecked={account.publicProfileConsent} /> I consent to my name appearing on a story I submit, if published</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" name="announceEmail" defaultChecked={account.announceEmail} /> Email me alumni announcements</label>
              <label className="flex gap-2 text-sm"><input type="checkbox" name="eventEmail" defaultChecked={account.eventEmail} /> Email me alumni event notices</label>
              <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">Save profile</button>
            </form>
            <form action={logoutAlumni} className="mt-4">
              <button className="text-sm text-navy underline" type="submit">Sign out</button>
            </form>
            <form action={requestAlumniDeletion} className="mt-6">
              <button className="text-sm text-danger underline" type="submit">Request account deletion</button>
            </form>
          </div>
          <div className="space-y-8">
            <section className="border border-navy/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">Submit a story for review</h2>
              {params.story ? <p className="mt-2 text-sm text-ok">Submitted for review. It will not appear publicly until staff publish it.</p> : null}
              {params.error === "story" ? <p className="mt-2 text-sm text-danger">Please provide a fuller title, summary, and story.</p> : null}
              <form action={submitAlumniStory} className="mt-4 space-y-3">
                <input name="title" required placeholder="Title" className="min-h-11 w-full border border-navy/20 px-3" />
                <textarea name="summary" required rows={3} placeholder="Summary" className="w-full border border-navy/20 px-3 py-2" />
                <textarea name="body" required rows={8} placeholder="Story" className="w-full border border-navy/20 px-3 py-2" />
                <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">Submit for review</button>
              </form>
              <ul className="mt-6 text-sm">
                {stories.map((story) => (
                  <li key={story.id} className="border-t border-navy/10 py-2">
                    {story.title} · {story.status}
                  </li>
                ))}
              </ul>
            </section>
            <section className="border border-navy/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">Alumni announcements and events</h2>
              {params.interest ? <p className="mt-2 text-sm text-ok">Your interest has been recorded for staff review.</p> : null}
              {events.length ? (
                <ul className="mt-4 divide-y divide-navy/10">
                  {events.map((event) => (
                    <li key={event.id} className="py-3">
                      <p className="font-semibold text-navy">{event.title}</p>
                      <p className="text-sm text-muted">{event.startAt ? formatSchoolDateTime(event.startAt) : "Date to be confirmed"}</p>
                      <p className="text-sm text-muted">{event.summary}</p>
                      <EventInterestForm
                        eventId={event.id}
                        title={event.title}
                        from="/alumni/portal"
                        defaultName={account.name}
                        defaultEmail={account.email}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No alumni events published" description="Approved reunion and community events will appear here." />
              )}
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
