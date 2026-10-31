import Link from "next/link";
import { FeatureCard } from "@/components/ui/cards";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { getProjects, getSiteSettings } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { paymentsConfigured } from "@/lib/integrations/payments";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Support the college",
    description: "Approved Jinja College development projects. Online donations are only offered when a payment provider is configured and confirmed.",
    path: "/support",
  });
}

export default async function SupportPage() {
  const [settings, flags, projects] = await Promise.all([getSiteSettings(), getModuleFlags(), getProjects()]);
  const open = projects.filter((item) => item.acceptDonations);
  const payments = paymentsConfigured();

  return (
    <>
      <PageHero
        eyebrow="Development"
        title="Support Jinja College"
        description={settings.supportIntro || "Support information is published only after the college approves project details and payment channels."}
        crumbs={[{ href: "/", label: "Home" }, { href: "/support", label: "Support" }]}
      />
      <section className="py-16">
        <div className="container-page">
          {!flags.donationsPage ? (
            <VerifyNotice>
              Public support pages are not enabled. The college has not activated this module, and this website does not invent donation accounts or fundraising totals.
            </VerifyNotice>
          ) : (
            <>
              <SectionHeading title="Approved projects" description="No budgets, targets, or amounts raised are shown unless the college supplies verified figures." />
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {projects.length ? (
                  projects.map((project) => (
                    <FeatureCard
                      key={project.id}
                      title={project.title}
                      description={project.summary}
                      href={project.slug ? `/support/projects/${project.slug}` : undefined}
                      linkLabel="Read project"
                    />
                  ))
                ) : (
                  <EmptyState className="md:col-span-2" title="No development projects have been published" description="Project pages appear only after school approval." />
                )}
              </div>
              <div className="mt-12 border border-navy/10 bg-white p-6">
                <h2 className="font-serif text-2xl text-navy">Online donations</h2>
                {payments && open.length ? (
                  <p className="mt-3 text-muted">
                    A payment provider has been configured. A donation is recorded as successful only after that provider confirms it.
                  </p>
                ) : (
                  <p className="mt-3 text-muted">
                    Online donations are not enabled. Jinja College has not approved a payment provider, account details, or fundraising figures for this website.
                  </p>
                )}
                <Link href="/support/donate" className="mt-5 inline-flex min-h-11 items-center font-semibold text-navy underline">
                  Donation page
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
