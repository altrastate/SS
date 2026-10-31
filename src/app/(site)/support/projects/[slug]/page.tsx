import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { VerifyNotice } from "@/components/ui/states";
import { getProjectBySlug } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { paymentsConfigured } from "@/lib/integrations/payments";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return pageMetadata({ title: "Project not found", description: "This project is not available.", path: `/support/projects/${slug}`, noIndex: true });
  return pageMetadata({ title: project.title, description: project.summary, path: `/support/projects/${slug}` });
}

export default async function SupportProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const flags = await getModuleFlags();
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <PageHero
        eyebrow={project.statusLabel || "Development project"}
        title={project.title}
        description={project.summary}
        crumbs={[{ href: "/", label: "Home" }, { href: "/support", label: "Support" }, { href: `/support/projects/${project.slug}`, label: project.title }]}
      />
      <article className="py-16">
        <div className="container-narrow">
          <NewsArticleBody html={renderMarkdown(project.body)} />
          {project.publicUpdates ? (
            <section className="mt-10 border border-navy/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">Public updates</h2>
              <div className="mt-4">
                <NewsArticleBody html={renderMarkdown(project.publicUpdates)} />
              </div>
            </section>
          ) : null}
          {flags.donationsPage && project.acceptDonations && paymentsConfigured() ? (
            <p className="mt-8">
              <Link href={`/support/donate?project=${project.id}`} className="font-semibold text-navy underline">
                Support this project
              </Link>
            </p>
          ) : (
            <div className="mt-8">
              <VerifyNotice>
                Online giving for this project is not active. This page does not display fundraising totals or payment account numbers.
              </VerifyNotice>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
