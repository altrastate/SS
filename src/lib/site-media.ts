export const SCHOOL_CREST = "/images/kapchorwa-ss-badge.png";

export const HOME_NAV = [
  { href: "/#about", label: "About" },
  { href: "/#headteacher", label: "Head Teacher" },
  { href: "/#academics", label: "Academics" },
  { href: "/#life", label: "Student Life" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#news", label: "News" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const HERO_SLIDES = [
  {
    src: "/images/hero-slide-1.jpg",
    alt: "A view of Kapchorwa.",
    eyebrow: "Knowledge Is Our Future Light",
    titleBefore: "Welcome to ",
    titleAccent: "Kapchorwa S.S.",
    titleAfter: "",
    description:
      "A government-aided mixed day secondary school in Kawowo, Kapchorwa Municipality, offering O-Level and A-Level.",
    primary: { href: "/#contact", label: "Ask about admission" },
    secondary: { href: "/#about", label: "About the school" },
  },
  {
    src: "/images/hero-slide-2.jpg",
    alt: "Highland views around Kapchorwa.",
    eyebrow: "Kawowo, Kapchorwa",
    titleBefore: "Learning in the ",
    titleAccent: "highlands",
    titleAfter: "",
    description: "Girls and boys study together on a campus in Central Division, Kapchorwa Municipality.",
    primary: { href: "/#history", label: "Our story" },
    secondary: { href: "/#life", label: "Student life" },
  },
  {
    src: "/images/hero-slide-3.jpg",
    alt: "Towei, in Kapchorwa.",
    eyebrow: "O-Level and A-Level",
    titleBefore: "Knowledge that ",
    titleAccent: "leads",
    titleAfter: "",
    description: "Senior 1 to Senior 6 under the Uganda national curriculum, confirmed with the school office.",
    primary: { href: "/#academics", label: "Explore academics" },
    secondary: { href: "/#contact", label: "Contact the office" },
  },
  {
    src: "/images/hero-slide-4.jpg",
    alt: "Sipi valley in Kapchorwa District.",
    eyebrow: "Sebei",
    titleBefore: "Rooted in ",
    titleAccent: "Kapchorwa",
    titleAfter: "",
    description: "A day school for the community, with sport, clubs, and a standard of discipline in every class.",
    primary: { href: "/#values", label: "Our values" },
    secondary: { href: "/#gallery", label: "See Kapchorwa" },
  },
] as const;

export const PILLARS = [
  {
    title: "Academic work",
    body: "O-Level and A-Level classes under the Uganda national curriculum, from Senior 1 to Senior 6.",
    image: "/images/pillar-academic.jpg",
  },
  {
    title: "Discipline",
    body: "A structured school day that expects respect, punctuality, and responsibility from every learner.",
    image: "/images/pillar-discipline.jpg",
  },
  {
    title: "Leadership",
    body: "The motto on the crest — Knowledge Is Our Future Light — asks students to lead with what they learn.",
    image: "/images/hero-slide-4.jpg",
  },
] as const;

export const LIFE_TILES = [
  {
    title: "Sports",
    body: "Athletics, football, and other games in a highland town known for sport",
    image: "/images/life-sports.jpg",
  },
  {
    title: "Clubs and culture",
    body: "Music, drama, and clubs when the school publishes the current list",
    image: "/images/life-arts.jpg",
  },
  {
    title: "Leadership",
    body: "Prefects, class leaders, and student responsibility",
    image: "/images/life-leadership.jpg",
  },
  {
    title: "School transport",
    body: "A 40-seater school bus acquired in 2024 with parents and the board",
    image: "/images/life-tours.jpg",
  },
] as const;

export const GALLERY_IMAGES = [
  "/images/hero-slide-1.jpg",
  "/images/hero-slide-2.jpg",
  "/images/hero-slide-3.jpg",
  "/images/hero-slide-4.jpg",
  "/images/about-students.jpg",
  "/images/about-classroom.jpg",
  "/images/pillar-academic.jpg",
  "/images/pillar-discipline.jpg",
  "/images/life-sports.jpg",
  "/images/life-arts.jpg",
  "/images/life-leadership.jpg",
  "/images/life-tours.jpg",
] as const;

export const O_LEVEL_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Christian Religious Education",
  "Agriculture",
  "ICT",
  "Entrepreneurship",
  "Literature",
  "Kiswahili",
  "Physical Education",
];

export const A_LEVEL_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Economics",
  "Geography",
  "History",
  "Divinity",
  "Literature",
  "Agriculture",
  "Entrepreneurship",
  "General Paper",
  "Sub-ICT",
];

export const HOME_TIMELINE = [
  {
    year: "Kawowo",
    title: "The campus",
    description:
      "Kapchorwa Senior Secondary School is a government-aided day school in Kawowo Parish, Central Division, Kapchorwa Municipality. OpenStreetMap places the campus at Kisenyi in Kapchorwa Town Council.",
  },
  {
    year: "Centre",
    title: "A UNEB school",
    description:
      "The Uganda National Examinations Board lists the school as Kapchorwa Secondary School, P.O. Box 114, Kapchorwa. The published EMIS number is 3857.",
  },
  {
    year: "2024",
    title: "A school bus",
    description:
      "Head teacher Johnson Kitikoy Yesho announced a 40-seater bus, registration UBR006B, bought with contributions from parents, students, the board of governors, and well-wishers.",
  },
  {
    year: "2026",
    title: "UCE on campus",
    description:
      "During the 2026 Uganda Certificate of Education briefings, head teacher James Mnyokos said candidates would sit their papers without unnecessary interruptions.",
  },
] as const;

export const OFFICIAL_NEWS = [
  {
    href: "https://ugandaradionetwork.net/story/uneb-urges-schools-to-submit-continuous-assessment-scores-as-uce-exams-kick-off-with-briefing-",
    image: "/images/pillar-academic.jpg",
    date: "October 9, 2026",
    title: "Candidates briefed as UCE 2026 begins",
    summary:
      "Head teacher James Mnyokos said Kapchorwa Senior Secondary School candidates would not be interrupted unnecessarily during the papers.",
  },
  {
    href: "https://www.sebeination.com/new-school-bus-excites-students-and-teachers-at-kapchorwa-ss/",
    image: "/images/life-tours.jpg",
    date: "July 28, 2024",
    title: "Kapchorwa SS receives a new school bus",
    summary:
      "Parents, students, and the board helped the school acquire a 40-seater bus, registration UBR006B.",
  },
  {
    href: "/admissions",
    image: "/images/about-classroom.jpg",
    date: "This term",
    title: "Ask the office about admission",
    summary:
      "Senior 1 and Senior 5 places are confirmed by the school office. Call the published numbers or send an enquiry.",
  },
] as const;
