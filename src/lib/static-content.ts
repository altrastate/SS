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

const STAMP = new Date("2024-07-28T00:00:00.000Z");

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
    question: "Where is Kapchorwa Senior Secondary School?",
    answer:
      "The school is in Kawowo Parish, Central Division, Kapchorwa Municipality, Kapchorwa District. Its postal address on the UNEB list is P.O. Box 114, Kapchorwa. OpenStreetMap places the campus at Kisenyi in Kapchorwa Town Council.",
  },
  {
    id: "faq-boarding",
    category: "general",
    sortOrder: 2,
    status: "published",
    question: "Is Kapchorwa Senior Secondary School a boarding or day school?",
    answer:
      "Published school directories list Kapchorwa Senior Secondary School as a government day school. It admits girls and boys. Confirm current day arrangements with the school office.",
  },
  {
    id: "faq-levels",
    category: "general",
    sortOrder: 3,
    status: "published",
    question: "What levels of education does the school offer?",
    answer:
      "The school offers O-Level (Senior 1 to Senior 4) and A-Level (Senior 5 to Senior 6) under the Uganda national curriculum.",
  },
  {
    id: "faq-admission",
    category: "admissions",
    sortOrder: 4,
    status: "published",
    question: "What are the admission requirements?",
    answer:
      "In the Uganda system, O-Level admission is normally based on Primary Leaving Examination performance and A-Level admission on Uganda Certificate of Education results. Interviews and vacancies are confirmed by Kapchorwa Senior Secondary School. Contact the office for the latest information.",
  },
  {
    id: "faq-faith",
    category: "general",
    sortOrder: 5,
    status: "published",
    question: "Who can apply?",
    answer:
      "Kapchorwa Senior Secondary School is a mixed government-aided day school. Girls and boys may apply. Families should confirm the current intake with the school office.",
  },
  {
    id: "faq-contact",
    category: "admissions",
    sortOrder: 6,
    status: "published",
    question: "How do I contact the school about admission?",
    answer:
      "Use the admissions enquiry form on this website, or call the numbers on the contact page. The office line published in school directories is +256 454 451 067. Confirm it with the school before using it for urgent or financial matters.",
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
      "Ordinary Level education at Kapchorwa Senior Secondary School follows the Uganda national curriculum for Senior 1 to Senior 4.",
    body: "The school offers O-Level as a mixed day pathway. Subject lists and class arrangements should be confirmed with the office.\n\nO-Level entry in Uganda is normally based on Primary Leaving Examination performance. Families should contact the school for the latest admission information.",
  },
  {
    id: "pathway-a-level",
    slug: "a-level",
    name: "A-Level",
    levelLabel: "Senior 5 to Senior 6",
    sortOrder: 2,
    status: "published",
    summary: "Advanced Level education is offered in Senior 5 and Senior 6.",
    body: "Kapchorwa Senior Secondary School offers A-Level education under the Uganda national curriculum. Current subject combinations are confirmed by the school. A-Level admission is normally based on Uganda Certificate of Education results.",
  },
];

export const STATIC_CAMPUS: CampusLifeSection[] = [
  {
    id: "campus-day",
    slug: "the-school-day",
    title: "The school day",
    sortOrder: 1,
    status: "published",
    summary: "Kapchorwa Senior Secondary School is listed as a government day school for girls and boys.",
    body: "Students attend from Kawowo and the surrounding communities of Kapchorwa Municipality. Daily routines and reporting times are confirmed by the school office.",
  },
  {
    id: "campus-sports",
    slug: "sports",
    title: "Sports",
    sortOrder: 2,
    status: "published",
    summary: "Athletics and ball games are part of student life in Kapchorwa.",
    body: "Sport sits alongside classwork. Fixtures, coaching staff, and team lists are published when the school authorises them. In 2024 the school acquired a bus that can carry teams and students.",
  },
  {
    id: "campus-clubs",
    slug: "clubs",
    title: "Clubs and societies",
    sortOrder: 3,
    status: "published",
    summary: "Clubs, music, drama, and student leadership can be listed here when the school supplies a directory.",
    body: "Club lists, meeting times, and patrons will be added when an approved directory is supplied.",
  },
  {
    id: "campus-welfare",
    slug: "student-welfare",
    title: "Student welfare",
    sortOrder: 4,
    status: "published",
    summary: "Pastoral care and guidance sit with the school administration.",
    body: "This website does not publish private student information. Welfare contacts and counselling arrangements will be added when the school confirms them.",
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
    bio: "James Mnyokos was named as head teacher of Kapchorwa Senior Secondary School during the 2026 Uganda Certificate of Education briefings. A formal portrait has not been supplied for this website, so the school crest is shown.",
  },
];

export const STATIC_GALLERY: GalleryItem[] = GALLERY_IMAGES.map((imageUrl, index) => ({
  id: `gallery-${index + 1}`,
  title: "Kapchorwa",
  caption: null,
  imageUrl,
  altText: "Photograph of Kapchorwa and school life",
  category: "Kapchorwa",
  sortOrder: index + 1,
  status: "published",
  createdAt: STAMP,
}));
