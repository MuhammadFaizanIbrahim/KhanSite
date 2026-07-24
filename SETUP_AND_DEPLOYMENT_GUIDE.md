# KhanConcepts — Setup, SEO & Deployment Guide

A step-by-step walkthrough from getting this repo running on your machine to it being a fully live, search-engine-visible website. Follow the sections in order the first time; after that, jump straight to whichever section you need.

---

## 1. Prerequisites

Install these once, before anything else:

- **Node.js** — version 18 or newer (this project was built/tested on Node 22). Download from [nodejs.org](https://nodejs.org).
- **Git** — to clone the repository.
- A code editor (VS Code recommended).

Verify both are installed:

```bash
node -v
git --version
```

---

## 2. Clone the repository and install dependencies

```bash
git clone <your-repo-url>
cd khan-react
npm install
```

This installs React, Vite, TypeScript, and every other package listed in `package.json` — nothing else to configure at this step.

---

## 3. Set up environment variables

Create a file named `.env` in the project root (same folder as `package.json`). This file is never committed to Git — it holds your private keys/URLs.

```bash
# Required — powers the Contact page's submission form (Google Apps Script)
VITE_CONTACT_SCRIPT_URL=

```
## 4. Run the site locally

```bash
npm run dev
```

Open the URL it prints (typically `http://localhost:5173`). The site hot-reloads as you edit files.

---

## 5. Editing the website's text and concepts

**Everything editable — every heading, button label, description, and every Concept's details — lives in one file:**

```
src/content/site.json
```

You do **not** need to touch any `.tsx` code to change text. Open `site.json` and:

- Each top-level key is one section of the site (its `_section` note says where it appears).
- Wrapping a phrase in `**double asterisks**` makes it render in gold.
- To add a new Concept, copy an existing entry inside `"concepts-page" → "items"` and fill in its fields (name, industry, image, description, overview paragraphs, etc.).

Changes here take effect the next time you run `npm run dev` or `npm run build` — no code changes needed.

---

## 6. (Optional) Editing content without a redeploy

The site supports fetching `site.json` from a public URL at runtime instead of the bundled copy — useful if a non-technical client wants to edit text without asking a developer to rebuild/redeploy:

1. Upload `src/content/site.json` to a public file host (e.g. a Cloudflare R2 bucket set to public).
2. Set `VITE_CONTENT_URL` (Section 3) to that file's public URL, both locally and in your production hosting's environment variables.
3. From then on, editing that hosted copy and saving it updates the live site within seconds — no rebuild required. If the fetch ever fails (file deleted, host down), the site silently falls back to the bundled copy, so it can never go fully blank.

Skip this section entirely if that workflow isn't needed yet — the bundled `site.json` works fine on its own.

---

## 7. How SEO is implemented (reference — no action needed day-to-day)

This is already built; this section is so you understand what's there when you open `site.json`'s `"seo"` block.

- **Titles, descriptions, keywords** — set per page in `site.json → seo → home / concepts / contact`. Leave a page's `image` blank to fall back to `seo.defaultImage`.
- **Individual Concept pages** — each Concept automatically gets its own unique title/description generated from its own data; nothing to configure per-concept.
- **Organization schema (JSON-LD)** — tells Google this is a real business, built from `seo.siteName`, `seo.domain`, `seo.logo`, and `seo.social` (your X/LinkedIn/YouTube/Instagram links). Update those fields in `site.json` and it updates everywhere automatically.
- **Open Graph / Twitter Card tags** — control the preview shown when a link is shared on WhatsApp, Slack, X, etc. Same `seo` fields drive these.
- **`robots.txt`** (`public/robots.txt`) — tells search engines they're allowed to crawl everything, and points them at the sitemap.
- **404 page** — any unmatched URL shows a proper "page not found" page (not indexed by Google) instead of a blank screen.

The code implementing all of this lives in `src/seo/` (typed helper functions) and `src/components/SEO.tsx` (renders the actual tags) — you generally shouldn't need to edit either; changing `site.json` is enough for all routine updates.

---

## 8. How the sitemap works

`public/sitemap.xml` is **auto-generated on every build** — you never hand-edit it.

- The generator script is `scripts/generate-sitemap.js`, run automatically as a `prebuild` step before every `npm run build`.
- It reads every Concept from `site.json` and lists `/`, `/concepts`, `/contact`, and one `/concepts/<slug>` URL per Concept.
- **Adding a new Concept in `site.json` automatically adds it to the sitemap on the next build — no extra step.**
- The domain baked into the URLs is `https://khanconcepts.com`. To generate a sitemap for a different domain (e.g. testing a preview URL), run:
  ```bash
  SITE_URL=https://your-preview-url.vercel.app npm run build
  ```

---

## 9. Building for production

```bash
npm run build
```

This runs the sitemap generator, then Vite's production build, outputting everything to the `dist/` folder. Sanity-check it locally before deploying:

```bash
npm run preview
```

---

## 10. Deployment

The live site (client's custom domain) is deployed on **Cloudflare Pages**. `vercel.json` is also kept in the repo for the developer's own Vercel preview/testing deploys — it isn't used in the client's production setup and can be ignored/removed in any copy of the repo handed to the client.

**Cloudflare Pages (production):**

1. Push the repo to GitHub (or GitLab).
2. In Cloudflare: **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** → select the repo.
3. Build settings:
   - Framework preset: `Vite` (or None — the commands below are explicit either way)
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add your environment variables (Section 3) under **Settings → Environment variables** — they won't carry over from your local `.env` automatically.
5. Deploy. Cloudflare gives you a `*.pages.dev` URL immediately.
6. **Connect the custom domain**: **Custom domains** tab → add `khanconcepts.com` → follow Cloudflare's DNS instructions (a one-click CNAME if the domain's nameservers are already on Cloudflare).

`public/_redirects` already contains the SPA fallback rule this site needs (client-side routing via React Router means every path — `/concepts`, `/contact`, etc. — must fall back to `index.html` on direct navigation/refresh, not 404) — no extra config needed:

```
/*  /index.html  200
```

**Vercel (developer testing only):** `vercel.json` at the root configures the same build command and SPA rewrite for quick preview deploys via Vercel's dashboard — not part of the client handoff.

---

## 11. After the domain is live — search engine setup

These are manual, one-time steps outside this codebase:

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)) — add `khanconcepts.com` as a property, verify ownership (Search Console gives you a DNS TXT record or HTML file to prove it), then submit `https://khanconcepts.com/sitemap.xml` under **Sitemaps**.
2. **Google Analytics 4** — create a GA4 property, get its Measurement ID, and it can be wired into `index.html` (ask your developer to add it once you have the ID).
3. Re-check indexing in Search Console after a few days — it'll show which pages Google has crawled and flag any errors.

---

## 12. Ongoing maintenance checklist

For everyday updates, this is really all there is:

- **New Concept?** → add it to `site.json`. Sitemap and SEO tags update automatically on the next build.
- **Change a page's title/description?** → edit `site.json → seo`.
- **Change social links?** → edit `site.json → seo.social` (also updates the Organization schema automatically).
- **Anything else text-related?** → `site.json`, following its own `_section` notes.
- **Code changes** (new components, new pages, new routes) → still require a developer.
