import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/defaults";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "change-this-password";
  const name = process.env.ADMIN_NAME || "Website Administrator";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      role: "super_admin",
      passwordHash: await hash(password, 12),
    },
  });

  await prisma.user.updateMany({
    where: { role: "admin" },
    data: { role: "super_admin" },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: DEFAULT_SETTINGS,
  });

  const pathwayCount = await prisma.academicPathway.count();
  if (pathwayCount === 0) {
    await prisma.academicPathway.createMany({
      data: [
        {
          slug: "o-level",
          name: "O-Level",
          levelLabel: "Senior 1 to Senior 4",
          sortOrder: 1,
          status: "published",
          summary:
            "Ordinary Level education at Kapchorwa Senior Secondary School follows the Uganda national curriculum for Senior 1 to Senior 4.",
          body: "Kapchorwa Senior Secondary School offers O-Level as a mixed day pathway. Subject lists and class arrangements should be confirmed with the office.\n\nO-Level entry in Uganda is normally based on Primary Leaving Examination performance. Families should contact the school for the latest admission information.",
        },
        {
          slug: "a-level",
          name: "A-Level",
          levelLabel: "Senior 5 to Senior 6",
          sortOrder: 2,
          status: "published",
          summary:
            "Advanced Level education is offered in Senior 5 and Senior 6. The college’s published history records that A-Level studies in arts and sciences began in 1981.",
          body: "Kapchorwa Senior Secondary School offers A-Level education under the Uganda national curriculum. Current subject combinations are confirmed by the school. A-Level admission is normally based on Uganda Certificate of Education results.",
        },
      ],
    });
  }

  if ((await prisma.timelineEvent.count()) === 0) {
    await prisma.timelineEvent.createMany({
      data: [
        {
          year: "Kawowo",
          title: "The campus",
          description:
            "Kapchorwa Senior Secondary School is a government-aided day school in Kawowo Parish, Central Division, Kapchorwa Municipality.",
          sortOrder: 1,
          verified: true,
          status: "published",
        },
        {
          year: "Centre",
          title: "A UNEB school",
          description:
            "The Uganda National Examinations Board lists the school as Kapchorwa Secondary School, P.O. Box 114, Kapchorwa. The published EMIS number is 3857.",
          sortOrder: 2,
          verified: true,
          status: "published",
        },
        {
          year: "2024",
          title: "A school bus",
          description:
            "Head teacher Johnson Kitikoy Yesho announced a 40-seater bus, registration UBR006B, bought with contributions from parents, students, the board of governors, and well-wishers.",
          sortOrder: 3,
          verified: true,
          status: "published",
        },
      ],
    });
  }

  if ((await prisma.campusLifeSection.count()) === 0) {
    await prisma.campusLifeSection.createMany({
      data: [
        {
          slug: "the-school-day",
          title: "The school day",
          sortOrder: 1,
          summary: "Kapchorwa Senior Secondary School is listed as a government day school for girls and boys.",
          body: "Students attend from Kawowo and the surrounding communities of Kapchorwa Municipality. Daily routines and reporting times are confirmed by the school office.",
        },
        {
          slug: "student-welfare",
          title: "Student welfare",
          sortOrder: 2,
          summary: "The college’s published plans treat student welfare as part of school life.",
          body: "This section is awaiting approved school content on pastoral care, house systems, and student support. No private student information is published on this website.",
        },
        {
          slug: "dining",
          title: "Dining",
          sortOrder: 3,
          summary: "Dining is recorded among the college’s school services.",
          body: "Menus, meal times, and related operational details will be published after confirmation. This section does not invent current catering arrangements.",
        },
        {
          slug: "sports",
          title: "Sports",
          sortOrder: 4,
          summary: "Athletics and ball games are part of student life in Kapchorwa.",
          body: "Sport sits alongside classwork at Kapchorwa Senior Secondary School. Fixtures, coaching staff, and team lists are published when the school authorises them.",
        },
        {
          slug: "clubs",
          title: "Clubs and societies",
          sortOrder: 5,
          summary: "Debate, music, drama, cultural clubs, and leadership activities are among those currently described by the college.",
          body: "Club lists, meeting times, and patrons will be added when an approved directory is supplied. Every description remains editable.",
        },
        {
          slug: "student-leadership",
          title: "Student leadership",
          sortOrder: 6,
          summary: "Student leadership is part of school life for girls and boys.",
          body: "Prefect bodies and current student officers are not named on this website. Leadership structures can be described here after school confirmation.",
        },
        {
          slug: "spiritual-life",
          title: "Spiritual life",
          sortOrder: 7,
          summary: "Students of all faiths are welcome. Worship arrangements are confirmed by the school.",
          body: "Details of worship and pastoral programmes will be published after the school confirms them. No religious affiliation is stated here beyond that welcome.",
        },
        {
          slug: "guidance",
          title: "Guidance and counselling",
          sortOrder: 8,
          summary: "Guidance is part of the college’s published educational work.",
          body: "This section is awaiting approved school content. Appointed counsellors are not named until confirmed.",
        },
        {
          slug: "health",
          title: "Health and safety",
          sortOrder: 9,
          summary: "Medical services are recorded among college operations in school planning documents.",
          body: "Clinic hours, staffing, and emergency procedures will be published after the school confirms them. This website does not store student health records.",
        },
        {
          slug: "facilities",
          title: "Campus facilities",
          sortOrder: 10,
          summary: "Public directories have referred to classrooms and a library. Current laboratory details are confirmed by the school.",
          body: "Photographs and detailed facility descriptions can replace this summary when the school supplies them. Boarding houses are not listed, because published directories describe the school as a day school.",
        },
      ],
    });
  }

  if ((await prisma.fAQ.count()) === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          category: "general",
          sortOrder: 1,
          question: "Where is Kapchorwa Senior Secondary School?",
          answer:
            "The school is in Kawowo Parish, Central Division, Kapchorwa Municipality, Kapchorwa District. Its postal address on the UNEB list is P.O. Box 114, Kapchorwa.",
        },
        {
          category: "general",
          sortOrder: 2,
          question: "Is Kapchorwa Senior Secondary School a boarding or day school?",
          answer: "Published school directories list it as a government day school for girls and boys. Confirm current arrangements with the office.",
        },
        {
          category: "general",
          sortOrder: 3,
          question: "What levels of education does the school offer?",
          answer:
            "The college offers O-Level (Senior 1 to Senior 4) and A-Level (Senior 5 to Senior 6) under the Uganda national curriculum.",
        },
        {
          category: "admissions",
          sortOrder: 4,
          question: "What are the admission requirements?",
          answer:
            "Currently published college guidance states that admissions are based on Primary Leaving Examination performance for O-Level and Uganda Certificate of Education results for A-Level, and that entrance interviews may also apply. Contact the school for the latest admission information.",
        },
        {
          category: "general",
          sortOrder: 5,
          question: "Who can apply?",
          answer:
            "Kapchorwa Senior Secondary School is a mixed government-aided day school. Girls and boys may apply. Families should confirm the current intake with the school office.",
        },
        {
          category: "admissions",
          sortOrder: 6,
          question: "How do I contact the school about admission?",
          answer:
            "Use the admissions enquiry form on this website, or contact the college office using the details on the contact page. Confirm current telephone numbers with the school before using them for urgent or financial matters.",
        },
      ],
    });
  }

  if ((await prisma.staffProfile.count()) === 0) {
    await prisma.staffProfile.create({
      data: {
        title: "Head Teacher",
        name: null,
        namePending: true,
        photoUrl: "/images/kapchorwa-ss-badge.png",
        category: "leadership",
        status: "published",
        sortOrder: 1,
        bio: "The current Head Teacher’s name will be published after school confirmation. The portrait shown is the approved Head Teacher photograph supplied for this website.",
      },
    });
  }

  if ((await prisma.galleryItem.count()) === 0) {
    await prisma.galleryItem.create({
      data: {
        title: "Learning with ICT",
        caption: "Students at work with laptops during a college learning session.",
        imageUrl: "/images/pillar-academic.jpg",
        altText: "Study at Kapchorwa Senior Secondary School.",
        category: "Academics",
        sortOrder: 1,
        status: "published",
      },
    });
  }

  if ((await prisma.newsArticle.count()) === 0) {
    await prisma.newsArticle.create({
      data: {
        slug: "website-content-awaiting-school-notices",
        title: "College notices will appear here",
        summary:
          "This draft article is an example for staff. It is not visible on the public website until it is published.",
        body: "Authorised staff can replace this draft with approved news, circulars, and announcements.\n\nDo not publish fees, examination results, or personal student information without school approval.",
        category: "Announcement",
        authorName: "Website editor",
        status: "draft",
      },
    });
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      locationLine: DEFAULT_SETTINGS.locationLine,
      streetAddress: DEFAULT_SETTINGS.streetAddress,
      officeHours: DEFAULT_SETTINGS.officeHours,
      aboutOverview: DEFAULT_SETTINGS.aboutOverview,
      academicsIntro: DEFAULT_SETTINGS.academicsIntro,
      campusIntro: DEFAULT_SETTINGS.campusIntro,
      headTeacherQuote: DEFAULT_SETTINGS.headTeacherQuote,
      headTeacherName: DEFAULT_SETTINGS.headTeacherName,
      headTeacherNamePending: false,
      headTeacherPhotoUrl: DEFAULT_SETTINGS.headTeacherPhotoUrl,
      ogImageUrl: "/images/kapchorwa-ss-badge.png",
    },
  });

  await prisma.staffProfile.updateMany({
    where: { title: "Head Teacher" },
    data: {
      name: "Mr. James Mnyokos",
      namePending: false,
      photoUrl: "/images/kapchorwa-ss-badge.png",
      bio: "James Mnyokos was named as head teacher of Kapchorwa Senior Secondary School during the 2026 Uganda Certificate of Education briefings. A formal portrait has not been supplied, so the school crest is shown.",
    },
  });

  const galleryPhotos = [
    { title: "Kapchorwa highlands", caption: "The country around Kapchorwa.", imageUrl: "/images/hero-slide-1.jpg", altText: "Highlands around Kapchorwa, Uganda.", category: "Kapchorwa", sortOrder: 1 },
    { title: "The municipality", caption: "Kapchorwa Municipality.", imageUrl: "/images/hero-slide-2.jpg", altText: "Landscape in Kapchorwa District.", category: "Kapchorwa", sortOrder: 2 },
    { title: "Learning", caption: "A learning space.", imageUrl: "/images/hero-slide-3.jpg", altText: "A learning space.", category: "Academics", sortOrder: 3 },
    { title: "Sebei", caption: "Open country in the Sebei highlands.", imageUrl: "/images/hero-slide-4.jpg", altText: "Open country around Kapchorwa.", category: "Kapchorwa", sortOrder: 4 },
    { title: "School day", caption: "Discipline and the school day.", imageUrl: "/images/pillar-discipline.jpg", altText: "Kapchorwa highland light.", category: "Campus", sortOrder: 5 },
    { title: "Academics", caption: "O-Level and A-Level study.", imageUrl: "/images/pillar-academic.jpg", altText: "Study at Kapchorwa Senior Secondary School.", category: "Academics", sortOrder: 6 },
    { title: "Sport", caption: "Athletics country around Kapchorwa.", imageUrl: "/images/life-sports.jpg", altText: "Highland country associated with athletics in Kapchorwa.", category: "Sport", sortOrder: 7 },
    { title: "School bus", caption: "The school acquired a bus in 2024.", imageUrl: "/images/life-tours.jpg", altText: "A road in the Kapchorwa highlands.", category: "Campus", sortOrder: 8 },
  ];
  for (const photo of galleryPhotos) {
    const existing = await prisma.galleryItem.findFirst({ where: { imageUrl: photo.imageUrl } });
    if (existing) {
      await prisma.galleryItem.update({ where: { id: existing.id }, data: { ...photo, status: "published" } });
    } else {
      await prisma.galleryItem.create({ data: { ...photo, status: "published" } });
    }
  }

  if (!(await prisma.timelineEvent.findFirst({ where: { year: "2026" } }))) {
    await prisma.timelineEvent.create({
      data: {
        year: "2026",
        title: "UCE on campus",
        description:
          "During the 2026 Uganda Certificate of Education briefings, head teacher James Mnyokos said candidates would sit their papers without unnecessary interruptions.",
        sortOrder: 4,
        verified: true,
        status: "published",
      },
    });
  }

  if (!(await prisma.fAQ.findFirst({ where: { question: { contains: "parents stay updated" } } }))) {
    await prisma.fAQ.create({
      data: {
        category: "general",
        sortOrder: 7,
        question: "How do parents stay updated?",
        answer:
          "Through official circulars, this website, visitation days, and regular parent–teacher meetings. Optional notice subscriptions can be enabled by the college.",
        status: "published",
      },
    });
  }

  const notices = [
    {
      slug: "uce-2026-briefing",
      title: "Candidates briefed as UCE 2026 begins",
      summary:
        "Head teacher James Mnyokos said Kapchorwa Senior Secondary School candidates would not be interrupted unnecessarily during the papers.",
      publishedAt: new Date("2026-10-09"),
      coverImageUrl: "/images/pillar-academic.jpg",
      coverAltText: "Study at Kapchorwa Senior Secondary School.",
    },
    {
      slug: "school-bus-2024",
      title: "Kapchorwa S.S. receives a new school bus",
      summary:
        "Parents, students, and the board helped the school acquire a 40-seater bus, registration UBR006B.",
      publishedAt: new Date("2024-07-28"),
      coverImageUrl: "/images/life-tours.jpg",
      coverAltText: "A road in the Kapchorwa highlands.",
    },
  ];
  for (const article of notices) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      await prisma.newsArticle.create({
        data: {
          ...article,
          body: `${article.summary}\n\nThis notice is drawn from currently published college information. Further operational detail remains with the school office.`,
          category: "College life",
          status: "published",
          featured: article.slug === "uce-2026-briefing",
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin sign-in: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
