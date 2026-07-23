# KhanConcepts

The KhanConcepts marketing site — a single-page React app presenting the brand, its Concept Design catalogue, and a contact/booking flow.

For getting this running locally, environment variables, and deploying it, see **[SETUP_AND_DEPLOYMENT_GUIDE.md](SETUP_AND_DEPLOYMENT_GUIDE.md)**. This file is a map of the codebase itself.

---

## Tech stack

- **React 18 + TypeScript**, built with **Vite**
- **React Router** — client-side routing, 5 routes total (see below)
- **react-helmet-async** — per-page `<title>`/meta tag management
- **Tailwind CSS** — used sparingly for layout utility classes; almost all visual styling is inline `style` objects per component, not Tailwind classes
- **Lenis** — smooth-scroll library used on scrollable pages
- **Raw WebGL + GLSL** — the background/page-transition effects (no Three.js)

---

## Project structure

```
src/
├── components/
│   ├── SEO.tsx           — renders every page's <title>/meta/OG/Twitter/JSON-LD tags
│   ├── layout/            — Navbar, CenterNav, Sidebar, Dots (persistent chrome)
│   ├── sections/          — homepage sections (Hero, WhatIsKhanConcepts,
│   │                        ConceptDesignInnovation, ConceptToSolutionProcess,
│   │                        FeaturedConcepts, Footer)
│   └── ui/                — reusable visual primitives (StarDivider, Preloader,
│                             CustomCursor, GalaxyBackground, page-transition canvases)
│
├── content/
│   └── site.json          — every piece of editable text on the site, plus SEO
│                             config and the full Concepts catalogue. See below.
│
├── contexts/
│   └── TransitionContext.tsx — page-out/page-in transition animation state
│
├── data/
│   ├── concepts.ts         — TypeScript types for a Concept/ConceptSpace/ConceptType
│   └── shaders.ts          — GLSL shader source for the background/transition effects
│
├── hooks/
│   ├── useContent.ts       — reads a section of site.json (bundled, or a live
│   │                         remote copy if VITE_CONTENT_URL is set)
│   ├── useBreakpoint.ts    — mobile/tablet/desktop responsive flags
│   └── useLenis.ts         — smooth-scroll wiring
│
├── pages/
│   ├── HomePage.tsx        — "/"
│   ├── ConceptsPage.tsx    — "/concepts" (filterable/searchable listing)
│   ├── ConceptDetailPage.tsx — "/concepts/:slug" (one page per Concept)
│   ├── ContactPage.tsx     — "/contact" (booking form → Google Apps Script)
│   └── NotFoundPage.tsx    — "*" (any unmatched URL)
│
├── seo/                    — typed functions that turn site.json's "seo" data
│   │                         into the props <SEO> renders
│   ├── types.ts, constants.ts, social.ts, keywords.ts, schema.ts,
│   └── homepage.ts, concepts.ts, contact.ts, index.ts
│
└── utils/
    ├── slug.ts             — turns a Concept's name into its URL slug
    ├── embed.ts            — parses YouTube/Vimeo/Slides/Drive/Canva links into embeds
    └── richText.tsx        — renders "**gold text**" markup used throughout site.json

scripts/
└── generate-sitemap.js     — regenerates public/sitemap.xml from site.json on every
                              build (npm run prebuild)

public/
├── robots.txt
├── sitemap.xml             — generated file, not hand-edited (see script above)
├── manifest.webmanifest
├── _redirects              — SPA fallback rule (Cloudflare Pages/Netlify convention)
└── images/                 — logos, concept photos, featured images
```

---

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | `HomePage` | Hero, brand sections, featured concepts carousel |
| `/concepts` | `ConceptsPage` | Filterable/searchable grid of every Concept |
| `/concepts/:slug` | `ConceptDetailPage` | One per Concept — slug comes from `slugify(conceptName)` |
| `/contact` | `ContactPage` | Booking form, WhatsApp/email alt-contact methods |
| `*` (anything else) | `NotFoundPage` | 404, marked `noindex` for search engines |

---

## Content model — `site.json` is the single source of truth

Every heading, label, button, description, and every Concept's data lives in **`src/content/site.json`**. Nothing here is hardcoded in components — pages call `useContent('<section-key>')` to read their slice of it. This means routine content changes (new Concept, reworded copy, updated SEO title) never require touching `.tsx` code.

`site.json` also supports being swapped for a live remote copy at runtime (`VITE_CONTENT_URL`, e.g. hosted on Cloudflare R2) so non-developers can update content without a rebuild/redeploy — see the setup guide for how to wire that up.

---

## SEO system

`src/seo/` holds one function per concern, each taking the live `seo` section of `site.json` and returning resolved data — nothing is hardcoded:

- `homepage.ts` / `concepts.ts` / `contact.ts` — resolve each page's title/description/image/keywords, plus `getConceptDetailSEO` for individual Concept pages
- `schema.ts` — builds the JSON-LD graph: `Organization` (name, domain, logo, social links), `WebSite`, and the current page's own entity (`WebPage` by default, `CollectionPage` for `/concepts`, `ContactPage` for `/contact`, set via each page's `schemaType`)
- `social.ts` / `keywords.ts` — small typed accessors into `site.json`
- `constants.ts` — the few *technical* defaults that aren't editable content (default `robots` value, OG type, theme color, etc.)

Every page uses the same pattern:

```tsx
const seo = useContent('seo')
<SEO {...getHomepageSEO(seo)} />
```

`src/components/SEO.tsx` is the only component that actually renders tags — title, meta description/keywords/robots/author/theme-color, canonical, Open Graph, Twitter Card, and the JSON-LD script.

---

## Scripts

```bash
npm run dev       # local dev server
npm run build     # prebuild (regenerates sitemap.xml) + production build → dist/
npm run preview   # serve the production build locally
```

---

## Full setup, environment variables, and deployment steps

See **[SETUP_AND_DEPLOYMENT_GUIDE.md](SETUP_AND_DEPLOYMENT_GUIDE.md)**.
