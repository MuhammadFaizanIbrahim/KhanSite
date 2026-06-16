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
  /* 0 ── INTRO */
  {
    id: 0,
    label: 'Intro',
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

  /* 1 ── ABOUT */
  {
    id: 1,
    label: 'About',
    nameMain: 'About',
    nameSub: 'Khan',
    tagline: 'Category Architect.',
    categories: [
      { text: 'Concept Architecture & Design', primary: true },
      { divider: true },
      { text: 'I innovate concepts that redefine industries — from product' },
      { text: 'and business architecture to civilizational systems.' },
    ],
    isVideo: true,
    videoSrc: '/videos/prod_concept.mp4',
    holdUntilVideoEnd: true,
  }
]

export const SECTION_INTERVAL = 5000