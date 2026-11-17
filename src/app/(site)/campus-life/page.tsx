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
      "The school day, sport, clubs, and student welfare at Kapchorwa Senior Secondary School, a mixed day school in Kapchorwa Municipality.",
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
          <FeatureCard title="Sports" description="Athletics, football, and other games. Fixtures are published when the school confirms them." />
          <FeatureCard title="Clubs and culture" description="Music, drama, and clubs when the school publishes the current list." />
          <FeatureCard title="Leadership" description="Prefects and class leaders. Current officers are not named here." />
          <FeatureCard title="School transport" description="A 40-seater bus acquired in 2024 with parents, students, and the board of governors." />
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
              description="Boarding is not listed for this school. Day routines, sport, clubs, and welfare details can be published by authorised staff."
            />
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Gallery"
            title="Kapchorwa photographs"
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
            description="Clinic hours and emergency procedures will be published after the school confirms them. This website does not store student health records."
          />
          <FeatureCard
            title="Guidance and counselling"
            description="Student guidance sits with the school. Appointed staff names are not published until confirmed."
          />
          <FeatureCard
            title="Facilities"
            description="Public directories have referred to classrooms and a library. Current laboratory and boarding details are not stated here until the school confirms them."
          />
        </div>
      </section>
    </>
  );
}
