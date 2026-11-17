import { AcademicTabs } from "@/components/home/AcademicTabs";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeEnquiryForm } from "@/components/home/HomeEnquiryForm";
import { MasonryGallery } from "@/components/home/MasonryGallery";
import { MottoMarquee } from "@/components/home/MottoMarquee";
import { NewsCarousel, type NewsCard } from "@/components/home/NewsCarousel";
import { SplitHeading } from "@/components/home/SplitHeading";
import { StatCounters } from "@/components/home/StatCounters";
import { Reveal } from "@/components/motion/Reveal";
import { getFaqs, getLatestNews, getSiteSettings, getTimeline } from "@/lib/content";
import { HOME_TIMELINE, LIFE_TILES, OFFICIAL_NEWS, PILLARS } from "@/lib/site-media";
import { pageMetadata } from "@/lib/seo";
import { formatDate, parseValues } from "@/lib/utils";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const meta = pageMetadata({
    title: settings.metaTitle,
    description: settings.metaDescription,
    path: "/",
    image: "/images/about-students.jpg",
  });
  return { ...meta, title: { absolute: settings.metaTitle } };
}

export default async function HomePage() {
  const [settings, news, timeline, faqs] = await Promise.all([
    getSiteSettings(),
    getLatestNews(6),
    getTimeline(),
    getFaqs(),
  ]);
  const mapQuery = encodeURIComponent(settings.mapQuery || settings.locationLine);
  const newsItems: NewsCard[] =
    news.length > 0
      ? news.map((item) => ({
          href: `/news/${item.slug}`,
          image: item.coverImageUrl || "/images/about-students.jpg",
          date: formatDate(item.publishedAt || item.createdAt),
          title: item.title,
          summary: item.summary,
        }))
      : OFFICIAL_NEWS.map((item) => ({ ...item, external: true }));
  const history = timeline.length
    ? timeline.map((item) => ({ year: item.year, title: item.title, description: item.description }))
    : HOME_TIMELINE;
  const phoneHref = settings.phone?.replace(/\s/g, "") || "";
  const secondHref = settings.secondaryPhone?.replace(/\s/g, "") || "";
  const values = parseValues(settings.valuesJson);

  return (
    <>
      <HeroCarousel />
      <MottoMarquee />
      <StatCounters foundingYear={settings.foundingYear} />

      <section className="section" id="foundation">
        <Reveal className="head">
          <p className="eyebrow dark">Our foundation</p>
          <SplitHeading>
            What <em>drives</em> us
          </SplitHeading>
        </Reveal>
        <div className="drives">
          <Reveal className="drive">
            <h3>Our Vision</h3>
            <p>{settings.vision}</p>
          </Reveal>
          <Reveal className="drive" delay={80}>
            <h3>Our Mission</h3>
            <p>{settings.mission}</p>
          </Reveal>
          <Reveal className="drive" delay={160}>
            <h3>Core Values</h3>
            {values.length ? (
              <ul>
                {values.map((value) => (
                  <li key={value.title}>
                    <strong>{value.title}.</strong> {value.body}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{settings.inspiration}</p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="about section" id="about">
        <Reveal className="about-media">
          <img src="/images/about-students.jpg" alt="Kapchorwa highlands" className="m1" />
          <img src="/images/about-classroom.jpg" alt="The highland road through Kapchorwa" className="m2" />
          <div className="badge">
            <b>KSS</b>
            <span>
              Kawowo
              <br />
              Kapchorwa
            </span>
          </div>
        </Reveal>
        <Reveal className="about-text">
          <p className="eyebrow dark">About the school</p>
          <SplitHeading>
            Knowledge that prepares <em>girls and boys</em> to lead.
          </SplitHeading>
          <p>
            Kapchorwa Senior Secondary School is a government-aided mixed day school in Kawowo, Central
            Division, Kapchorwa Municipality. We offer O&apos; Level (S.1–S.4) and A&apos; Level (S.5–S.6) under
            the Uganda national curriculum.
          </p>
          <div className="vm">
            <div>
              <h4>Vision</h4>
              <p>{settings.vision}</p>
            </div>
            <div>
              <h4>Mission</h4>
              <p>{settings.mission}</p>
            </div>
          </div>
          <ul className="ticks">
            <li>Long tradition of academic excellence</li>
            <li>Dedicated, professional teaching staff</li>
            <li>Vibrant sports &amp; co-curricular life</li>
            <li>Values-based, disciplined environment</li>
          </ul>
        </Reveal>
      </section>

      <section className="ht section" id="headteacher">
        <Reveal className="ht-photo">
          <div className="frame">
            <img
              src={settings.headTeacherPhotoUrl || "/images/kapchorwa-ss-badge.png"}
              alt={
                settings.headTeacherName
                  ? `${settings.headTeacherName}, ${settings.headTeacherTitle}`
                  : settings.headTeacherTitle
              }
            />
          </div>
          <div className="ht-name">
            <b>{settings.headTeacherName || settings.headTeacherTitle}</b>
            <span>{settings.headTeacherTitle}</span>
          </div>
        </Reveal>
        <Reveal className="ht-text">
          <p className="eyebrow">From the Head Teacher</p>
          <span className="quote-mark">“</span>
          <blockquote>{settings.headTeacherQuote}</blockquote>
          <p>
            Classwork comes first, and it is not the only standard. Character, sport, service, and leadership
            belong in the same school day for every girl and every boy.
          </p>
          <p>Parents, students, and friends of Kapchorwa Senior Secondary School are welcome.</p>
          <div className="sig">{settings.headTeacherName?.replace(/^Mr\.\s/, "") || settings.headTeacherTitle}</div>
        </Reveal>
      </section>

      <section className="section values" id="values">
        <Reveal className="head">
          <p className="eyebrow dark">What we stand for</p>
          <SplitHeading>
            Built on <em>three pillars</em>
          </SplitHeading>
        </Reveal>
        <div className="cards">
          {PILLARS.map((item, index) => (
            <Reveal key={item.title}>
              <article className="pillar-card">
                <img src={item.image} alt="" />
                <div>
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section history" id="history">
        <Reveal className="head">
          <p className="eyebrow">Our story</p>
          <SplitHeading>
            A journey through <em>time</em>
          </SplitHeading>
        </Reveal>
        <div className="timeline">
          {history.map((item) => (
            <Reveal key={`${item.year}-${item.title}`} className="t">
              <b>{item.year}</b>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section academics" id="academics">
        <Reveal className="head">
          <p className="eyebrow dark">Academics</p>
          <SplitHeading>
            Two levels, one <em>standard</em>
          </SplitHeading>
        </Reveal>
        <Reveal>
          <AcademicTabs />
        </Reveal>
        <div className="facilities">
          {[
            { icon: "⚗", title: "Sciences", body: "Physics, chemistry, biology, and agriculture" },
            { icon: "⌨", title: "ICT", body: "Computer studies for O-Level and A-Level" },
            { icon: "❦", title: "Library", body: "A school library for quiet study" },
            { icon: "🚌", title: "School bus", body: "A 40-seater bus acquired in 2024" },
          ].map((item) => (
            <Reveal key={item.title} className="f">
              <i>{item.icon}</i>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section life" id="life">
        <Reveal className="head">
          <p className="eyebrow">Student life</p>
          <SplitHeading>
            Where talent finds its <em>stage</em>
          </SplitHeading>
        </Reveal>
        <div className="life-grid">
          {LIFE_TILES.map((item) => (
            <Reveal key={item.title} className="l" style={{ ["--img" as string]: `url('${item.image}')` }}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section gallery" id="gallery">
        <Reveal className="head">
          <p className="eyebrow dark">School gallery</p>
          <SplitHeading>
            Moments of <em>Kapchorwa</em>
          </SplitHeading>
        </Reveal>
        <MasonryGallery />
        <p className="mt-6 text-center text-sm text-muted">
          The photographs on this page are a view of Kapchorwa from Wikimedia Commons
          (Kapchorwa.jpg, Creative Commons BY-SA 4.0). They show the district, not a claimed
          campus shoot. The school can replace them with its own pictures.
        </p>
      </section>

      <section className="section news" id="news">
        <Reveal className="head">
          <p className="eyebrow dark">News &amp; notices</p>
          <SplitHeading>
            Latest from <em>campus</em>
          </SplitHeading>
        </Reveal>
        <NewsCarousel items={newsItems} />
      </section>

      {faqs.length ? (
        <section className="section faq" id="faq">
          <Reveal className="head">
            <p className="eyebrow dark">FAQ</p>
            <SplitHeading>
              Questions parents <em>ask</em>
            </SplitHeading>
          </Reveal>
          <div className="acc">
            {faqs.map((item) => (
              <Reveal key={item.id}>
                <details>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="motto-section" id="motto">
        <div className="motto-layout">
          <Reveal>
            <p className="eyebrow">School motto</p>
            <p className="motto-latin">{settings.motto}</p>
            <p className="motto-english">The words on the Kapchorwa S.S. crest</p>
          </Reveal>
          <Reveal className="motto-text-col" delay={100}>
            <p>
              For a school whose motto is “{settings.motto}”, learning is not kept for examinations alone. It is
              the lead students are asked to take in character, work, and service.
            </p>
            <p>
              The standard is the same for every learner, girl or boy, from Senior 1 through Senior 6.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-inner">
          <Reveal>
            <p className="eyebrow">Admissions</p>
            <SplitHeading>
              Give your child a start built on <em>knowledge</em>.
            </SplitHeading>
            <ul className="info">
              <li>
                <b>Address</b>
                {settings.streetAddress || settings.locationLine}
                {settings.postalAddress ? `, ${settings.postalAddress}` : ""}
              </li>
              <li>
                <b>Phone</b>
                {settings.phone ? <a href={`tel:${phoneHref}`}>{settings.phone}</a> : "To be confirmed with the school office"}
                {settings.secondaryPhone ? (
                  <>
                    {" · "}
                    <a href={`tel:${secondHref}`}>{settings.secondaryPhone}</a>
                  </>
                ) : null}
              </li>
              {settings.email ? (
                <li>
                  <b>Email</b>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              ) : (
                <li>
                  <b>Postal address</b>
                  {settings.postalAddress || "P.O. Box 114, Kapchorwa"}
                </li>
              )}
              <li>
                <b>Office hours</b>
                {settings.officeHours || "Monday – Friday, 8:00am – 5:00pm"}
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <HomeEnquiryForm />
          </Reveal>
        </div>
        <iframe
          className="map"
          title="Map of Kapchorwa Senior Secondary School"
          loading="lazy"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        />
      </section>
    </>
  );
}
