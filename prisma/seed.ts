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
            "Ordinary Level education at Jinja College follows the Uganda national curriculum for Senior 1 to Senior 4.",
          body: "Jinja College offers O-Level as a boys' boarding pathway. Detailed subject lists, class arrangements, and current admission requirements will be published after confirmation by the school.\n\nCurrently published college guidance states that O-Level entry is based on Primary Leaving Examination performance, and that entrance interviews may also apply. Families should contact the school for the latest information.",
        },
        {
          slug: "a-level",
          name: "A-Level",
          levelLabel: "Senior 5 to Senior 6",
          sortOrder: 2,
          status: "published",
          summary:
            "Advanced Level education is offered in Senior 5 and Senior 6. The college’s published history records that A-Level studies in arts and sciences began in 1981.",
          body: "Jinja College offers A-Level education under the Uganda national curriculum. The college’s Strategic Development Plan records that the school became an A-Level institution offering science and arts subjects in 1981.\n\nCurrent subject combinations are not listed here until the school supplies an approved list. Currently published college guidance states that A-Level admission is based on Uganda Certificate of Education results, and that entrance interviews may also apply.",
        },
      ],
    });
  }

  if ((await prisma.timelineEvent.count()) === 0) {
    await prisma.timelineEvent.createMany({
      data: [
        {
          year: "1946",
          title: "Foundation and move to Rubaga Hill",
          description:
            "Jinja College was founded by the Mill Hill Missionary Fathers. The institution began in Budini and was transferred to Rubaga Hill, occupying premises vacated by the Franciscan Sisters. Fr. Mc Gough became the first head teacher of the college in its new home.",
          sortOrder: 1,
          verified: true,
          status: "published",
        },
        {
          year: "1965",
          title: "Government-aided secondary status",
          description:
            "The college became a government-aided school and was upgraded to secondary status (Senior 1 to Senior 4), with Fr. John Jones as head teacher.",
          sortOrder: 2,
          verified: true,
          status: "published",
        },
        {
          year: "1981",
          title: "Advanced Level introduced",
          description:
            "Jinja College became an A-Level secondary school offering science and arts subjects, with Mr. Boniface Kategano as head teacher.",
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
          slug: "boarding",
          title: "Boarding",
          sortOrder: 1,
          summary: "Jinja College is a full boarding secondary school for boys.",
          body: "Residential life is central to the college. Jinja College is a government-aided boys' boarding school on Rubaga Hill. House arrangements, daily routines, and boarding contacts will be published after the school supplies approved details.",
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
          summary: "Currently published college information refers to rugby, football, and athletics among student activities.",
          body: "Sport is part of co-curricular life at Jinja College. Fixtures, coaching staff, and team lists are not published here until the school authorises them.",
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
          summary: "Student leadership is part of the college’s stated formation of young men.",
          body: "Prefect bodies and current student officers are not named on this website. Leadership structures can be described here after school confirmation.",
        },
        {
          slug: "spiritual-life",
          title: "Spiritual life",
          sortOrder: 7,
          summary: "Jinja College is Catholic-founded and welcomes students of all faiths.",
          body: "The college promotes values of respect, discipline, and service. Details of chapel life and pastoral programmes will be published after confirmation.",
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
          summary: "Currently published college information refers to science laboratories, ICT facilities, a library, dormitories, sports grounds, and classrooms.",
          body: "Photographs and detailed facility descriptions can replace this summary when approved images and wording are supplied.",
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
          question: "Where is Jinja College located?",
          answer:
            "Jinja College is on Rubaga Hill, Jinja City, Uganda. Currently published school information also describes the college as standing along the Jinja–Kampala highway, about two kilometres north of Jinja City.",
        },
        {
          category: "general",
          sortOrder: 2,
          question: "Is Jinja College a boarding or day school?",
          answer: "Jinja College is a full boarding secondary school for boys.",
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
          question: "Does Jinja College have a religious affiliation?",
          answer:
            "Jinja College is a Catholic-founded school. It welcomes students of all faiths and promotes respect, discipline, and service.",
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
        photoUrl: "/images/head-teacher.webp",
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
        imageUrl: "/images/campus-ict.jpg",
        altText: "Jinja College students using laptops during a learning session.",
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
      ogImageUrl: "/images/jinja_College_Badge.png",
    },
  });

  await prisma.staffProfile.updateMany({
    where: { title: "Head Teacher" },
    data: {
      name: "Mr. Dhikusooka Michael",
      namePending: false,
      photoUrl: "/images/head-teacher.webp",
      bio: "Head Teacher of Jinja College. The portrait shown is the approved Head Teacher photograph supplied for this website.",
    },
  });

  const galleryPhotos = [
    { title: "College community", caption: "Jinja College gathered on the college steps.", imageUrl: "/images/hero-welcome.jpg", altText: "Jinja College students and staff on the college steps.", category: "Community", sortOrder: 1 },
    { title: "Teaching and learning", caption: "Classroom work at the college.", imageUrl: "/images/hero-classroom.jpg", altText: "A teacher with students in a Jinja College classroom.", category: "Academics", sortOrder: 2 },
    { title: "Campus ICT", caption: "Students at work with computers.", imageUrl: "/images/hero-campus.jpg", altText: "Jinja College students working with computers.", category: "Academics", sortOrder: 3 },
    { title: "College gathering", caption: "A campus gathering at Jinja College.", imageUrl: "/images/hero-values.jpg", altText: "Jinja College students at a campus gathering.", category: "Campus", sortOrder: 4 },
    { title: "Boarding and discipline", caption: "Structured boarding and college life.", imageUrl: "/images/pillar-discipline.jpg", altText: "Jinja College students during campus life.", category: "Campus", sortOrder: 5 },
    { title: "Seventy-five years", caption: "The college community at a jubilee gathering.", imageUrl: "/images/gallery-75-years.jpg", altText: "Jinja College community at an anniversary gathering.", category: "Heritage", sortOrder: 6 },
    { title: "Assembly", caption: "College assembly on campus.", imageUrl: "/images/gallery-assembly.jpg", altText: "Jinja College students at assembly.", category: "Campus", sortOrder: 7 },
    { title: "Students", caption: "Student life at Jinja College.", imageUrl: "/images/gallery-students.jpg", altText: "Jinja College students on campus.", category: "Campus", sortOrder: 8 },
    { title: "Community", caption: "College community life.", imageUrl: "/images/gallery-community.jpg", altText: "Jinja College community on campus.", category: "Community", sortOrder: 9 },
    { title: "Celebration", caption: "A college celebration.", imageUrl: "/images/gallery-celebration.jpg", altText: "Jinja College celebration on campus.", category: "Campus", sortOrder: 10 },
    { title: "Campus life", caption: "Everyday campus life at Jinja College.", imageUrl: "/images/gallery-campus-life.jpg", altText: "Everyday campus life at Jinja College.", category: "Campus", sortOrder: 11 },
    { title: "Learning with ICT", caption: "Students at work with laptops during a college learning session.", imageUrl: "/images/campus-ict.jpg", altText: "Jinja College students using laptops during a learning session.", category: "Academics", sortOrder: 12 },
  ];
  for (const photo of galleryPhotos) {
    const existing = await prisma.galleryItem.findFirst({ where: { imageUrl: photo.imageUrl } });
    if (existing) {
      await prisma.galleryItem.update({ where: { id: existing.id }, data: { ...photo, status: "published" } });
    } else {
      await prisma.galleryItem.create({ data: { ...photo, status: "published" } });
    }
  }

  if (!(await prisma.timelineEvent.findFirst({ where: { year: "2024" } }))) {
    await prisma.timelineEvent.create({
      data: {
        year: "2024",
        title: "A new chapter",
        description:
          "Mr. Dhikusooka Michael takes the helm as Head Teacher, renewing the college’s call to Strive to Excel.",
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
      slug: "jinosh-2026",
      title: "JINOSH — Jinja College and St. Noa's School Zana",
      summary: "Soshi Night: when St. Noa's grace met Jinja College's spirit.",
      publishedAt: new Date("2026-04-20"),
      coverImageUrl: "/images/gallery-celebration.jpg",
      coverAltText: "Jinja College celebration.",
    },
    {
      slug: "prefects-handover-2026",
      title: "New leadership takes the helm",
      summary: "Prefects' handover and swearing-in ceremony.",
      publishedAt: new Date("2026-04-15"),
      coverImageUrl: "/images/gallery-assembly.jpg",
      coverAltText: "Jinja College assembly.",
    },
    {
      slug: "st-josephs-day-2026",
      title: "A memorable St. Joseph's Day",
      summary: "Honouring legacy and looking to the future.",
      publishedAt: new Date("2026-04-07"),
      coverImageUrl: "/images/gallery-75-years.jpg",
      coverAltText: "Jinja College community gathering.",
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
          featured: article.slug === "jinosh-2026",
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
