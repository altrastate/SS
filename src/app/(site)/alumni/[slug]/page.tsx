import { notFound } from "next/navigation";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { getAlumniBySlug, getProjectBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getAlumniBySlug(slug);
  const project = story ? null : await getProjectBySlug(slug);
  const item = story || project;
  if (!item) {
    return pageMetadata({
      title: "Not found",
      description: "This page is not available.",
      path: `/alumni/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: item.title,
    description: item.summary,
    path: `/alumni/${slug}`,
  });
}

export default async function AlumniDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getAlumniBySlug(slug);
  if (story) {
    return (
      <>
        <PageHero
          eyebrow="Alumni story"
          title={story.title}
          description={story.summary}
          crumbs={[
            { href: "/", label: "Home" },
            { href: "/alumni", label: "Alumni" },
            { href: `/alumni/${story.slug}`, label: story.title },
          ]}
        />
        <article className="py-16">
          <div className="container-narrow">
            <p className="text-sm text-muted">
              {story.personName || "Name published with approval"}
              {story.graduationYear ? ` · Class of ${story.graduationYear}` : ""}
            </p>
            <div className="mt-8">
              <NewsArticleBody html={renderMarkdown(story.body)} />
            </div>
          </div>
        </article>
      </>
    );
  }

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <PageHero
        eyebrow="Development project"
        title={project.title}
        description={project.summary}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/alumni", label: "Alumni" },
          { href: `/alumni/${project.slug}`, label: project.title },
        ]}
      />
      <article className="py-16">
        <div className="container-narrow">
          {project.statusLabel ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-ink">{project.statusLabel}</p> : null}
          <div className="mt-8">
            <NewsArticleBody html={renderMarkdown(project.body)} />
          </div>
          {project.publicUpdates ? (
            <section className="mt-10 border border-navy/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">Public updates</h2>
              <div className="mt-4">
                <NewsArticleBody html={renderMarkdown(project.publicUpdates)} />
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
