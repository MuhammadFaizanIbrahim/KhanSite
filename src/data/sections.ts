export interface Category {
  text?: string
  primary?: boolean
  divider?: boolean
}

export interface Section {
  id: number
  label: string
  sidebarParent?: string
  nameMain: string
  nameSub: string
  tagline: string
  categories: Category[]
  isVideo?: boolean            // uses a video background
  videoSrc?: string            // video file path — replace with real video later
  holdUntilVideoEnd?: boolean  // don't auto-advance until video finishes
  isOverlay?: boolean          // opens as overlay, not a section slide (Contact Me)
}

export const SECTIONS: Section[] = [
  /* 0 ── ABOUT */
  {
    id: 0,
    label: 'About',
    nameMain: 'Khan',
    nameSub: 'TheUnseen',
    tagline: 'A mind built to rethink everything.',
    categories: [
      { text: 'Innovator. Architect. Thinker.', primary: true },
      { divider: true },
      { text: 'I don\'t build products — I build the concepts' },
      { text: 'that become entire industries.' },
    ],
    isVideo: true,
    videoSrc: '/videos/hero.mp4',
    holdUntilVideoEnd: true,
  },

  /* 1 ── SERVICES › Product Concept Innovation */
  {
    id: 1,
    label: 'Product Concept Innovation',
    sidebarParent: 'Services',
    nameMain: 'Product',
    nameSub: 'Concept Innovation',
    tagline: 'Categories & Process',
    categories: [
      { text: 'Concept Architecture', primary: true },
      { text: 'Market Category Creation', primary: true },
      { divider: true },
      { text: 'User Experience Philosophy' },
      { text: 'Product–Market Fit Design' },
      { text: 'Innovation Roadmapping' },
    ],
    isVideo: true,
    videoSrc: '/videos/prod_concept.mp4',
    holdUntilVideoEnd: true,
  },

  /* 2 ── SERVICES › Business Concept Innovation */
  {
    id: 2,
    label: 'Business Concept Innovation',
    sidebarParent: 'Services',
    nameMain: 'Business',
    nameSub: 'Concept Innovation',
    tagline: 'Categories & Process',
    categories: [
      { text: 'Business Model Architecture', primary: true },
      { text: 'Revenue System Design', primary: true },
      { divider: true },
      { text: 'Organisational Concept Design' },
      { text: 'Strategic Innovation Framing' },
      { text: 'Ecosystem & Partnership Models' },
    ],
    isVideo: true,
    videoSrc: '/videos/business_concept.mp4',
    holdUntilVideoEnd: true,
  },

  /* 3 ── SERVICES › Scientific Research & Engineering */
  {
    id: 3,
    label: 'Deep Technology',
    sidebarParent: 'Services',
    nameMain: 'Scientific Research',
    nameSub: 'Deep Technology & Engineering',
    tagline: 'Invention & Foundational Systems — Categories & Process',
    categories: [
      { text: 'Scientific Research Frameworks', primary: true },
      { text: 'Deep Technology Concepts', primary: true },
      { divider: true },
      { text: 'Invention & Foundational Systems' },
      { text: 'Engineering Concept Innovation' },
      { text: 'First-Principles Problem Solving' },
    ],
    isVideo: true,
    videoSrc: '/videos/deep_tech.mp4',
    holdUntilVideoEnd: true,
  },

  /* 4 ── SERVICES › Civilizational Systems */
  {
    id: 4,
    label: 'Civilizational Systems',
    sidebarParent: 'Services',
    nameMain: 'Civilizational',
    nameSub: 'Systems Architecture',
    tagline: 'Ethical Structural Concept Innovation — Categories & Process',
    categories: [
      { text: 'Civilizational Systems Architecture', primary: true },
      { text: 'Ethical Structural Concept Innovation', primary: true },
      { divider: true },
      { text: 'Long-Horizon Thinking Frameworks' },
      { text: 'Societal Impact Design' },
      { text: 'Foundational Ethics in Innovation' },
    ],
    isVideo: true,
    videoSrc: '/videos/civ_sys.mp4',
    holdUntilVideoEnd: true,
  },

  /* 5 ── CONTACT ME — overlay, not a section slide */
  {
    id: 5,
    label: 'Contact Me',
    isOverlay: true,
    nameMain: 'Let\'s',
    nameSub: 'Connect',
    tagline: 'Have a concept worth building? Let\'s talk.',
    categories: [
      { text: 'hello@khan.com', primary: true },
      { divider: true },
      { text: 'Open to concept innovation partnerships' },
      { text: 'Research collaborations' },
      { text: 'Advisory engagements' },
    ],
  },

  /* 6 ── THE END */
  {
    id: 6,
    label: 'The End',
    nameMain: 'Khan',
    nameSub: 'TheUnseen',
    tagline: 'The beginning of every great industry starts with a single unseen concept.',
    categories: [],
    isVideo: true,
    videoSrc: '/videos/hero.mp4',
    holdUntilVideoEnd: false,
  },
]

export const SECTION_INTERVAL = 5000