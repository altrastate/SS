import { AcademicPathwayCard, DownloadCard, FeatureCard } from "@/components/ui/cards";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { A_LEVEL_SUBJECTS, O_LEVEL_SUBJECTS } from "@/lib/site-media";
import { getDepartments, getDownloads, getPathways, getSiteSettings } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Academics",
    description:
      "O-Level and A-Level academic pathways at Jinja College, with departmental information published after school confirmation.",
    path: "/academics",
  });
}

export default async function AcademicsPage() {
  const [settings, pathways, departments, downloads] = await Promise.all([
    getSiteSettings(),
    getPathways(),
    getDepartments(),
    getDownloads(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Teaching and learning"
        title="Academics"
        description={settings.academicsIntro || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/academics", label: "Academics" },
        ]}
      />

      <section className="py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Pathways" title="Ordinary and Advanced Level" />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {pathways.map((pathway) => (
              <div key={pathway.id} className="border border-navy/10 bg-white p-8">
                <AcademicPathwayCard
                  name={pathway.name}
                  levelLabel={pathway.levelLabel}
                  summary={pathway.summary}
                />
                <div className="mt-6">
                  <NewsArticleBody html={renderMarkdown(pathway.body)} />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(pathway.slug === "a-level" ? A_LEVEL_SUBJECTS : O_LEVEL_SUBJECTS).map((subject) => (
                    <span key={subject} className="subject-chip">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Subject lists follow currently published college descriptions. Combinations, options, and staffing are confirmed by the school.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Departments"
            title="Subject departments"
            description="Department names, staffing, and subject combinations are not invented here. Approved entries can be published from the content manager."
          />
          <div className="mt-10">
            {departments.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <FeatureCard
                    key={department.id}
                    title={department.name}
                    description={department.summary}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Department directory awaiting approved content"
                description="Official information will be published after confirmation."
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          <FeatureCard
            title="Curriculum"
            description="The college offers O-Level and A-Level studies under the Uganda national curriculum. Detailed subject lists and combinations will be published after school confirmation."
          />
          <FeatureCard
            title="Teaching and learning"
            description="Jinja College describes itself as a place of academic seriousness, discipline, and holistic education. Specific teaching programmes remain editable pending approved school content."
          />
          <FeatureCard
            title="Assessment"
            description="Public examination results, rankings, and performance statistics are not displayed on this website unless the school authorises them."
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Calendar and documents"
            title="Academic notices and downloads"
            description="Only documents approved for public release appear here."
          />
          <div className="mt-10 space-y-4">
            {downloads.length ? (
              downloads.map((item) => (
                <DownloadCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  href={item.fileUrl}
                />
              ))
            ) : (
              <EmptyState
                title="No public documents have been published"
                description="Academic calendars, circulars, and other files can be added by authorised staff."
              />
            )}
          </div>
          <div className="mt-8">
            <VerifyNotice>
              Do not treat this page as a complete statement of current subject combinations, staffing,
              or examination performance. Contact the school for the latest academic information.
            </VerifyNotice>
          </div>
        </div>
      </section>
    </>
  );
}
