import { FeatureCard } from "@/components/ui/cards";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { getCampusSections, getGallery, getSiteSettings } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Campus Life",
    description:
      "Boarding, sport, clubs, worship, and student welfare at Jinja College, a boys' boarding school in Jinja City.",
    path: "/campus-life",
  });
}

export default async function CampusLifePage() {
  const [settings, sections, gallery] = await Promise.all([
    getSiteSettings(),
    getCampusSections(),
    getGallery(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Student life"
        title="Campus life"
        description={settings.campusIntro || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/campus-life", label: "Campus life" },
        ]}
      />

      <section className="py-16">
        <div className="container-page mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard title="Sports" description="Rugby, football, athletics, volleyball, basketball, tennis, and chess." />
          <FeatureCard title="Music, dance and drama" description="Cultural galas, choir, and the annual Soshi Night." />
          <FeatureCard title="Leadership" description="Prefectship, clubs, and student councils. Current officers are not named here." />
          <FeatureCard title="Debate and tours" description="Debating, study trips, and industry visits as described by the college." />
        </div>
        <div className="container-page grid gap-8">
          {sections.length ? (
            sections.map((section) => (
              <article key={section.id} id={section.slug} className="border border-navy/10 bg-white p-8">
                <h2 className="font-serif text-3xl text-navy">{section.title}</h2>
                <p className="mt-3 text-muted">{section.summary}</p>
                <div className="mt-5">
                  <NewsArticleBody html={renderMarkdown(section.body)} />
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="Campus life sections awaiting approved content"
              description="Boarding, sport, clubs, and welfare details can be published by authorised staff."
            />
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Gallery"
            title="College photographs"
            description="Only approved images are shown. Student names and private details are not published."
          />
          <div className="mt-10">
            {gallery.length ? (
              <GalleryGrid items={gallery} />
            ) : (
              <EmptyState
                title="No gallery images have been published"
                description="Approved photographs can be added from the content manager."
              />
            )}
          </div>
          <div className="mt-8">
            <VerifyNotice>
              Operational details such as dining menus, clinic procedures, and house lists are not
              invented on this website. Where a heading exists, it is ready for approved school content.
            </VerifyNotice>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Health and safety"
            description="The college’s published development plan records medical services among school operations. Current clinic details will be published after confirmation."
          />
          <FeatureCard
            title="Guidance and counselling"
            description="Student guidance is part of the college’s stated educational work. Appointed staff names are not published until confirmed."
          />
          <FeatureCard
            title="Facilities"
            description="Currently published college information refers to science laboratories, ICT facilities, a library, dormitories, sports grounds, and classrooms."
          />
        </div>
      </section>
    </>
  );
}
