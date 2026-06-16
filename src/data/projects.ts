export interface Project {
  id: number
  title: string
  brand: string
  category: string
  subCategory: string
  image: string
  heroImage: string
  year: string
  description: string
  details: Array<{ question: string; answer: string }>
  /** Google Slides embed URL — paste the embed link from File → Share → Publish to web */
  slidesUrl?: string
}

export const PROJECTS: Project[] = [
  // ── Product Concept Innovation ──────────────────────────────────────────────
  {
    id: 1,
    title: 'HAPTIC HORIZON',
    brand: 'NeuralTouch',
    category: 'Product Concept Innovation',
    subCategory: 'Hardware',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&h=900&fit=crop',
    year: '2025',
    description: 'A next-generation haptic interface glove that translates digital environments into precise tactile feedback — allowing surgeons, engineers, and designers to physically feel what exists only in code.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'The problem we were solving',
        answer: 'Every digital interface asks you to look and click. None of them let you feel. We asked what it would mean to design a product that closes the sensory gap between the physical and digital — starting with the hands.',
      },
      {
        question: 'Design philosophy',
        answer: 'The glove needed to disappear. Any device that calls attention to itself has already failed. We spent 14 months on material research alone — the final form uses a bio-responsive textile that adjusts pressure distribution in real time.',
      },
      {
        question: 'First applications',
        answer: 'Surgical simulation, remote-presence robotics, and immersive design tooling. In early trials, surgeons using Haptic Horizon reported a 40% reduction in procedure errors during simulated operations versus screen-only training.',
      },
    ],
  },
  {
    id: 2,
    title: 'AURA LENS',
    brand: 'Lumient',
    category: 'Product Concept Innovation',
    subCategory: 'Wearables',
    image: 'https://images.unsplash.com/photo-1536152470836-b943b246224c?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1536152470836-b943b246224c?w=1600&h=900&fit=crop',
    year: '2024',
    description: 'A biometric AR lens that surfaces real-time physiological data directly in your field of vision — turning the body\'s own signals into an ambient, always-on health intelligence layer.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'Why a lens, not a watch?',
        answer: 'Wrist-based wearables require you to break attention and look down. Aura Lens keeps health data in peripheral vision — present when you need it, invisible when you don\'t. The data comes to you, not the other way around.',
      },
      {
        question: 'The sensing architecture',
        answer: 'A micro-array of photonic sensors embedded in the lens rim reads blood oxygen, cortisol markers, hydration, and cardiovascular load passively — no skin contact required, no charging interruption.',
      },
      {
        question: 'Regulatory pathway',
        answer: 'We worked with FDA advisors from prototype stage. Aura Lens is designed for Class II medical device classification, enabling it to be prescribed by physicians while remaining available as a consumer product.',
      },
    ],
  },

  // ── Business Concept Innovation ─────────────────────────────────────────────
  {
    id: 3,
    title: 'MESH MARKET',
    brand: 'Nodalab',
    category: 'Business Concept Innovation',
    subCategory: 'Platform',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop',
    year: '2024',
    description: 'A decentralized peer-to-peer marketplace architecture that eliminates intermediary rent extraction — letting producers and consumers transact with full price transparency and zero platform fees.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'The business model problem',
        answer: 'Every marketplace extracts value from both sides of a transaction — sellers pay listing fees, buyers pay markups, and the platform profits from information asymmetry. Mesh Market is built on the premise that this model is structurally extractive and replaceable.',
      },
      {
        question: 'How it works',
        answer: 'Smart contract escrow replaces the platform intermediary. Reputation is stored on-chain and portable across markets. The protocol is open — anyone can build a vertical marketplace on top of it without license fees.',
      },
      {
        question: 'Traction',
        answer: 'Pilot launched across three commodity markets in Southeast Asia. $14M in transaction volume in the first six months. Platform fee cost to participants: zero. Fraud rate: 0.003% — lower than every incumbent in the category.',
      },
    ],
  },
  {
    id: 4,
    title: 'URBAN FLUX',
    brand: 'Strata Mobility',
    category: 'Business Concept Innovation',
    subCategory: 'Ecosystem',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900&fit=crop',
    year: '2025',
    description: 'A unified urban mobility subscription that collapses transit, micro-mobility, and autonomous pods into a single monthly access layer — priced by zone density, not by trip.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'Why subscriptions change everything',
        answer: 'Per-trip pricing optimizes for individual journeys. Subscription pricing optimizes for urban efficiency. When the platform earns the same whether you take one trip or twenty, it is suddenly incentivized to help you move smarter — not just more.',
      },
      {
        question: 'The policy dimension',
        answer: 'Urban Flux is designed to be city-licensed, not city-tolerated. We co-developed the business model with three municipal governments to ensure the platform structure aligns with public transit goals rather than competing with them.',
      },
      {
        question: 'Outcome metrics',
        answer: 'In the Lisbon pilot, private car usage among subscribers dropped 62% within 90 days. Average commute cost fell by 34%. City congestion on pilot corridors reduced by 19%.',
      },
    ],
  },

  // ── Deep Technology ─────────────────────────────────────────────────────────
  {
    id: 5,
    title: 'CIPHER LATTICE',
    brand: 'Qryptex',
    category: 'Deep Technology',
    subCategory: 'Quantum',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop',
    year: '2024',
    description: 'A post-quantum cryptographic framework built on lattice-based algorithms — designed to secure financial and governmental infrastructure against the decryption capabilities of fault-tolerant quantum computers.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'Why now?',
        answer: 'Quantum computers capable of breaking current RSA and ECC encryption are estimated to be 7–15 years away. The time to migrate critical infrastructure is now — not after the threat is realized. This is a known, dated, and entirely preventable crisis.',
      },
      {
        question: 'The technical approach',
        answer: 'Cipher Lattice implements CRYSTALS-Kyber and CRYSTALS-Dilithium — NIST-selected post-quantum standards — in a modular framework that can be layered onto existing TLS infrastructure without full system replacement.',
      },
      {
        question: 'Deployment',
        answer: 'Currently in production with two G7 government agencies and four Tier 1 banks. Cipher Lattice passed FIPS 140-3 validation in Q3 2024 — the first post-quantum system to do so at Level 3.',
      },
    ],
  },
  {
    id: 6,
    title: 'SYNAPSE MAP',
    brand: 'Cortex Lab',
    category: 'Deep Technology',
    subCategory: 'AI / ML',
    image: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=1600&h=900&fit=crop',
    year: '2025',
    description: 'A neural architecture that maps cognitive load and emotional state in real time — enabling AI systems to adapt their behavior, pacing, and output density to the actual mental state of the person they\'re serving.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'The core insight',
        answer: 'Every AI system today is blind to the cognitive state of its user. It responds to what you type, not to whether you\'re overwhelmed, distracted, or in deep flow. Synapse Map gives AI the ability to sense and respond to human context — not just human input.',
      },
      {
        question: 'How it works technically',
        answer: 'A multimodal inference model combines keystroke dynamics, micro-pause patterns, cursor behavior, and optionally EEG data to build a real-time cognitive load profile. No cameras. No microphones. Entirely passive.',
      },
      {
        question: 'Applications',
        answer: 'Enterprise knowledge work, medical decision support, education platforms, and air traffic management. In knowledge work trials, users reported 28% lower end-of-day cognitive fatigue when working with Synapse Map-enabled tools.',
      },
    ],
  },

  // ── Civilizational Systems ──────────────────────────────────────────────────
  {
    id: 7,
    title: 'SOLARGRID OPEN',
    brand: 'Lumina Commons',
    category: 'Civilizational Systems',
    subCategory: 'Energy',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&h=900&fit=crop',
    year: '2023',
    description: 'An open-source distributed solar grid protocol that allows communities to build, own, and trade energy locally — eliminating dependence on centralized utility infrastructure for the 800 million people who live beyond its reach.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'The civilizational gap',
        answer: 'Energy poverty is not a supply problem. There is more solar potential on Earth than humanity could consume in a century. It is a distribution and ownership problem. SolarGrid Open is built on the premise that communities should own their energy, not rent it.',
      },
      {
        question: 'The protocol',
        answer: 'Any solar installation — from a single home panel to a village microgrid — can join the network. Excess energy is automatically traded peer-to-peer via smart contract. Grid balancing is distributed across participants, not managed by a central operator.',
      },
      {
        question: 'Impact at scale',
        answer: 'Deployed across 340 communities in sub-Saharan Africa and South Asia. 1.2 million people with first-time reliable electricity access. Average household energy cost reduction of 71% versus diesel generator dependency.',
      },
    ],
  },
  {
    id: 8,
    title: 'LEX PROTOCOL',
    brand: 'Agora Foundation',
    category: 'Civilizational Systems',
    subCategory: 'Governance',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&h=900&fit=crop',
    year: '2024',
    description: 'An open governance framework that enables participatory legislative drafting at scale — allowing citizens to propose, deliberate, and ratify local policy with the precision of legal language and the accessibility of plain speech.',
    slidesUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQaZQFT55NvoemKwiL5-QhPG4s4aEfGc17uvdDOs3BWrnM5IFT1fB8N4RzuGRGuT4xVEG5Gw-dRY3OG/pubembed?start=true&loop=true&delayms=3000', // Google Slides
    details: [
      {
        question: 'Why governance is a technology problem',
        answer: 'Representative democracy was designed for a pre-digital era where direct participation was physically impossible at scale. The bottleneck was logistics, not human will. That bottleneck no longer exists. Lex Protocol is what governance looks like when logistics are removed from the equation.',
      },
      {
        question: 'The dual-language layer',
        answer: 'Citizens draft proposals in natural language. An AI legislative layer simultaneously generates binding legal text in real time, visible to all participants. Discrepancies between intent and legal language are flagged before ratification — not discovered in court years later.',
      },
      {
        question: 'Pilots and outcomes',
        answer: 'Piloted in two cities in Estonia and one district in Taiwan — countries with strong digital governance traditions. Citizen participation in local policy drafting increased 8x. Time from proposal to ratification fell from an average of 14 months to 11 weeks.',
      },
    ],
  },
]

export const CATEGORIES = [
  'All',
  'Product Concept Innovation',
  'Business Concept Innovation',
  'Deep Technology',
  'Civilizational Systems',
]

export const SUB_CATS: Record<string, string[]> = {
  All:                           ['All', 'Hardware', 'Wearables', 'Platform', 'Ecosystem', 'Quantum', 'AI / ML', 'Energy', 'Governance'],
  'Product Concept Innovation':  ['All', 'Hardware', 'Wearables', 'UX / UI', 'Consumer Tech'],
  'Business Concept Innovation': ['All', 'Platform', 'Ecosystem', 'Market Strategy', 'Enterprise'],
  'Deep Technology':             ['All', 'Quantum', 'AI / ML', 'Biotech', 'Materials'],
  'Civilizational Systems':      ['All', 'Energy', 'Governance', 'Infrastructure', 'Education'],
}
