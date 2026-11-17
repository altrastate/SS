import Link from "next/link";
import { FeatureCard } from "@/components/ui/cards";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { SecondaryButton } from "@/components/ui/buttons";
import { getAlumniStories, getProjects, getSiteSettings } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { paymentsConfigured } from "@/lib/integrations/payments";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Alumni & Development",
    description:
      "Former students of Kapchorwa Senior Secondary School, and school development. Support information is published only after school confirmation.",
    path: "/alumni",
  });
}

export default async function AlumniPage() {
  const [settings, stories, projects, flags] = await Promise.all([
    getSiteSettings(),
    getAlumniStories(),
    getProjects(),
    getModuleFlags(),
  ]);
  const payments = paymentsConfigured();

  return (
    <>
      <PageHero
        eyebrow="Former students"
        title="Alumni and development"
        description={settings.alumniIntro || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/alumni", label: "Alumni" },
        ]}
      />

      <section className="py-16">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <article className="border border-navy/10 bg-white p-8">
            <SectionHeading eyebrow="Alumni" title="Former students of Kapchorwa S.S." />
            <p className="mt-5 text-muted">{settings.jicobaIntro}</p>
            {flags.alumniPortal ? (
              <p className="mt-6">
                <Link href="/alumni/portal" className="font-semibold text-navy underline">
                  Open the alumni portal
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-sm text-muted">A private alumni portal can be enabled by the school when account policies are approved.</p>
            )}
          </article>
          <article className="border border-navy/10 bg-white p-8">
            <SectionHeading eyebrow="Reunions" title="Community gatherings" />
            <p className="mt-5 text-muted">
              Reunion dates, venues, and registration details will be published after they are confirmed
              by the association or the school. No unofficial event is listed here.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Stories"
            title="Alumni stories"
            description="Personal profiles are published only with approval. This website does not invent alumni identities."
          />
          <div className="mt-10">
            {stories.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {stories.map((story) => (
                  <FeatureCard
                    key={story.id}
                    title={story.title}
                    description={story.summary}
                    href={`/alumni/${story.slug}`}
                    linkLabel="Read story"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No alumni stories have been published"
                description="Approved stories can be added from the content manager."
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="The school ahead"
            title="School development"
            description={settings.developmentIntro || undefined}
          />
          <div className="mt-10">
            {projects.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <article key={project.id} className="border border-navy/10 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">
                      {project.statusLabel || "Project"}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-navy">
                      {project.slug ? (
                        <a href={`/support/projects/${project.slug}`} className="hover:underline">
                          {project.title}
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <p className="mt-3 text-muted">{project.summary}</p>
                    {project.publicUpdates ? <p className="mt-3 text-sm text-muted">Public updates are available on the project page.</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No development projects have been published"
                description="Project descriptions, fundraising totals, and completion claims are not displayed unless the school authorises them."
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-ivory">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="Support"
              title="Giving and partnership"
              light
              description={
                flags.donationsPage && payments
                  ? "Approved projects are listed on the support pages. A donation is recorded as successful only after the payment provider confirms it."
                  : "Online donations are not enabled. Payment details for school support will be published only after the college confirms official channels."
              }
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <SecondaryButton href="/support" tone="light">
                Support the school
              </SecondaryButton>
              <SecondaryButton href="/contact" tone="light">
                Contact the school
              </SecondaryButton>
            </div>
          </div>
          <VerifyNotice>
            Do not send money through unofficial numbers, personal accounts, or social-media appeals.
            Wait for school-confirmed support channels.
          </VerifyNotice>
        </div>
      </section>
    </>
  );
}
