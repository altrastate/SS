import type {
  AcademicPathway,
  CampusLifeSection,
  FAQ,
  GalleryItem,
  StaffProfile,
  TimelineEvent,
  SiteSettings,
} from "@prisma/client";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { GALLERY_IMAGES, HOME_TIMELINE } from "@/lib/site-media";

const STAMP = new Date("1946-01-01T00:00:00.000Z");

export function staticSiteSettings(): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    updatedAt: STAMP,
  };
}

export const STATIC_FAQS: FAQ[] = [
  {
    id: "faq-location",
    category: "general",
    sortOrder: 1,
    status: "published",
    question: "Where is Jinja College located?",
    answer:
      "Jinja College is on Rubaga Hill, Jinja City, Uganda. Currently published school information also describes the college as standing along the Jinja–Kampala highway, about two kilometres north of Jinja City.",
  },
  {
    id: "faq-boarding",
    category: "general",
    sortOrder: 2,
    status: "published",
    question: "Is Jinja College a boarding or day school?",
    answer: "Jinja College is a full boarding secondary school for boys.",
  },
  {
    id: "faq-levels",
    category: "general",
    sortOrder: 3,
    status: "published",
    question: "What levels of education does the school offer?",
    answer:
      "The college offers O-Level (Senior 1 to Senior 4) and A-Level (Senior 5 to Senior 6) under the Uganda national curriculum.",
  },
  {
    id: "faq-admission",
    category: "admissions",
    sortOrder: 4,
    status: "published",
    question: "What are the admission requirements?",
    answer:
      "Currently published college guidance states that admissions are based on Primary Leaving Examination performance for O-Level and Uganda Certificate of Education results for A-Level, and that entrance interviews may also apply. Contact the school for the latest admission information.",
  },
  {
    id: "faq-faith",
    category: "general",
    sortOrder: 5,
    status: "published",
    question: "Does Jinja College have a religious affiliation?",
    answer:
      "Jinja College is a Catholic-founded school. It welcomes students of all faiths and promotes respect, discipline, and service.",
  },
  {
    id: "faq-contact",
    category: "admissions",
    sortOrder: 6,
    status: "published",
    question: "How do I contact the school about admission?",
    answer:
      "Use the admissions enquiry form on this website, or contact the college office using the details on the contact page. Confirm current telephone numbers with the school before using them for urgent or financial matters.",
  },
];

export const STATIC_TIMELINE: TimelineEvent[] = HOME_TIMELINE.map((item, index) => ({
  id: `timeline-${item.year}`,
  year: item.year,
  title: item.title,
  description: item.description,
  sortOrder: index + 1,
  verified: true,
  status: "published",
}));

export const STATIC_PATHWAYS: AcademicPathway[] = [
  {
    id: "pathway-o-level",
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
    id: "pathway-a-level",
    slug: "a-level",
    name: "A-Level",
    levelLabel: "Senior 5 to Senior 6",
    sortOrder: 2,
    status: "published",
    summary:
      "Advanced Level education is offered in Senior 5 and Senior 6. The college’s published history records that A-Level studies in arts and sciences began in 1981.",
    body: "Jinja College offers A-Level education under the Uganda national curriculum. Current subject combinations are not listed here until the school supplies an approved list. Currently published college guidance states that A-Level admission is based on Uganda Certificate of Education results, and that entrance interviews may also apply.",
  },
];

export const STATIC_CAMPUS: CampusLifeSection[] = [
  {
    id: "campus-boarding",
    slug: "boarding",
    title: "Boarding",
    sortOrder: 1,
    status: "published",
    summary: "Jinja College is a full boarding secondary school for boys.",
    body: "Residential life is central to the college. Jinja College is a government-aided boys' boarding school on Rubaga Hill. House arrangements, daily routines, and boarding contacts will be published after the school supplies approved details.",
  },
  {
    id: "campus-sports",
    slug: "sports",
    title: "Sports",
    sortOrder: 2,
    status: "published",
    summary: "Currently published college information refers to rugby, football, and athletics among student activities.",
    body: "Sport is part of co-curricular life at Jinja College. Fixtures, coaching staff, and team lists are not published here until the school authorises them.",
  },
  {
    id: "campus-clubs",
    slug: "clubs",
    title: "Clubs and societies",
    sortOrder: 3,
    status: "published",
    summary: "Debate, music, drama, cultural clubs, and leadership activities are among those currently described by the college.",
    body: "Club lists, meeting times, and patrons will be added when an approved directory is supplied.",
  },
  {
    id: "campus-faith",
    slug: "spiritual-life",
    title: "Spiritual life",
    sortOrder: 4,
    status: "published",
    summary: "Jinja College is Catholic-founded and welcomes students of all faiths.",
    body: "The college promotes values of respect, discipline, and service. Details of chapel life and pastoral programmes will be published after confirmation.",
  },
];

export const STATIC_STAFF: StaffProfile[] = [
  {
    id: "staff-head-teacher",
    title: "Head Teacher",
    name: DEFAULT_SETTINGS.headTeacherName,
    namePending: false,
    photoUrl: DEFAULT_SETTINGS.headTeacherPhotoUrl,
    category: "leadership",
    status: "published",
    sortOrder: 1,
    bio: "Head Teacher of Jinja College. The portrait shown is the approved Head Teacher photograph supplied for this website.",
  },
];

export const STATIC_GALLERY: GalleryItem[] = GALLERY_IMAGES.map((imageUrl, index) => ({
  id: `gallery-${index + 1}`,
  title: "Jinja College",
  caption: null,
  imageUrl,
  altText: "Jinja College campus photograph",
  category: "Campus",
  sortOrder: index + 1,
  status: "published",
  createdAt: STAMP,
}));
