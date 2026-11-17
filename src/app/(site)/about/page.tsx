import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState, VerifyNotice } from "@/components/ui/states";
import { Timeline } from "@/components/ui/Timeline";
import { SecondaryButton } from "@/components/ui/buttons";
import { getSiteSettings, getStaff, getTimeline } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { parseValues } from "@/lib/utils";

export async function generateMetadata() {
  return pageMetadata({
    title: "About the school",
    description:
      "Place, values, and leadership of Kapchorwa Senior Secondary School, a mixed day secondary school in Kapchorwa Municipality, Uganda.",
    path: "/about",
  });
}

function ProfileCard({
  title,
  name,
  bio,
  photoUrl,
  pending,
}: {
  title: string;
  name?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  pending?: boolean;
}) {
  return (
    <article className="border border-navy/10 bg-white p-6">
      {photoUrl ? (
        <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-ivory-dark">
          <Image src={photoUrl} alt={name ? `${name}, ${title}` : title} fill className="object-contain bg-navy" sizes="320px" />
        </div>
      ) : (
        <div className="mb-5 flex aspect-[4/5] items-end bg-ivory-dark p-4 text-sm text-muted">
          Official portrait to be supplied by the school.
        </div>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">{title}</p>
      <h3 className="mt-2 font-serif text-2xl text-navy">
        {pending || !name ? "Name awaiting confirmation" : name}
      </h3>
      <p className="mt-3 text-muted">
        {bio || "This section is awaiting approved school content."}
      </p>
    </article>
  );
}

export default async function AboutPage() {
  const [settings, timeline, leadership, board] = await Promise.all([
    getSiteSettings(),
    getTimeline(),
    getStaff("leadership"),
    getStaff("board"),
  ]);
  const values = parseValues(settings.valuesJson);

  return (
    <>
      <PageHero
        eyebrow="Institutional profile"
        title="About Kapchorwa S.S."
        description={settings.aboutOverview || undefined}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
      />

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Overview" title="A school for Kapchorwa" />
            <div className="prose-jico mt-6 text-muted">
              <p>{settings.aboutOverview}</p>
              <p>
                The campus is in Kawowo Parish, Central Division, Kapchorwa Municipality. It is a
                government-aided day school for girls and boys, offering ordinary and advanced secondary
                education. The postal address published by UNEB is P.O. Box 114, Kapchorwa.
              </p>
            </div>
          </div>
          <div className="border border-navy/10 bg-white p-8">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">Founded</dt>
                <dd className="mt-1 text-navy">
                  {settings.foundingYear >= 1900
                    ? settings.foundingYear
                    : "Year not yet confirmed for this website"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">Motto</dt>
                <dd className="mt-1 font-serif text-2xl text-navy">{settings.motto}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">Location</dt>
                <dd className="mt-1 text-navy">{settings.locationLine}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">Levels</dt>
                <dd className="mt-1 text-navy">O-Level (S1–S4) and A-Level (S5–S6)</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="History" title="On the public record" />
            <p className="mt-6 text-muted">{settings.historyText}</p>
            <p className="mt-4 text-muted">
              Older directory figures for enrolment and facilities are not repeated here as current facts.
              The school can replace this account when it confirms a fuller history.
            </p>
          </div>
          {timeline.length ? (
            <Timeline items={timeline} />
          ) : (
            <EmptyState
              title="Timeline awaiting approved content"
              description="Historical milestones will appear here after they have been confirmed by the school."
            />
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Purpose"
            title="Vision, mission, and values"
            description="These statements follow the school motto, Knowledge Is Our Future Light. The school can replace them with an approved development-plan wording at any time."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="border border-navy/10 bg-white p-6">
              <h3 className="font-serif text-2xl text-navy">Vision</h3>
              <p className="mt-3 text-muted">{settings.vision}</p>
            </article>
            <article className="border border-navy/10 bg-white p-6">
              <h3 className="font-serif text-2xl text-navy">Mission</h3>
              <p className="mt-3 text-muted">{settings.mission}</p>
            </article>
            <article className="border border-navy/10 bg-white p-6">
              <h3 className="font-serif text-2xl text-navy">Inspiration</h3>
              <p className="mt-3 text-muted">{settings.inspiration}</p>
            </article>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="border border-gold/40 bg-ivory p-6">
                <h3 className="font-serif text-2xl text-navy">{value.title}</h3>
                <p className="mt-3 text-muted">{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Leadership"
            title="School leadership"
            description="Approved portraits and biographies can be published from the content manager. Historical office-holders are not presented as the current leadership unless confirmed."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leadership.length ? (
              leadership.map((person) => (
                <ProfileCard
                  key={person.id}
                  title={person.title}
                  name={person.name}
                  bio={person.bio}
                  photoUrl={person.photoUrl}
                  pending={person.namePending}
                />
              ))
            ) : (
              <EmptyState
                className="md:col-span-2 lg:col-span-3"
                title="Leadership profiles awaiting confirmation"
                description="The school will supply names, titles, and approved portraits for this section."
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Governance"
            title="Board of Governors"
            description="Board membership is not published until the school supplies an approved list."
          />
          <div className="mt-10">
            {board.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {board.map((person) => (
                  <ProfileCard
                    key={person.id}
                    title={person.title}
                    name={person.name}
                    bio={person.bio}
                    pending={person.namePending}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Board profiles have not been published"
                description="This section is awaiting approved school content."
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-ivory">
        <div className="container-page grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Community"
              title="Former students and the school"
              light
              description={settings.alumniIntro || undefined}
            />
            <div className="mt-6">
              <SecondaryButton href="/alumni" tone="light">
                Alumni and development
              </SecondaryButton>
            </div>
          </div>
          <VerifyNotice>
            Historical office-holders named in older school documents are not presented here as the
            current leadership. Names, board lists, and contact roles remain subject to confirmation.
          </VerifyNotice>
        </div>
      </section>
    </>
  );
}
