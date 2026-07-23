// Regenerates public/sitemap.xml from src/content/site.json's concept list,
// so it never goes stale as concepts are added/removed/renamed. Runs
// automatically as a "prebuild" step (see package.json) — no manual step needed.
const fs = require('fs')
const path = require('path')

// Set SITE_URL as a build-time env var to override (e.g. for preview deploys).
const SITE_URL = process.env.SITE_URL || 'https://khanconcepts.com'

const site = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/content/site.json'), 'utf8')
)

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const staticRoutes = [
  { url: '/', priority: '1.0' },
  { url: '/concepts', priority: '0.9' },
  { url: '/contact', priority: '0.8' },
]
// De-duplicated by slug — multiple concept entries can share the same name
// (e.g. placeholder/test data) and would otherwise emit the same URL twice.
// Concepts flagged excludeFromSitemap stay live on the site but are left out
// of the sitemap (e.g. not ready for search engines to index yet).
const conceptSlugs = [...new Set(
  site['concepts-page'].items
    .filter(item => !item.excludeFromSitemap)
    .map(item => slugify(item.conceptName))
)]
const conceptRoutes = conceptSlugs.map(slug => ({ url: `/concepts/${slug}`, priority: '0.7' }))

const routes = [...staticRoutes, ...conceptRoutes]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${SITE_URL}${r.url}</loc><priority>${r.priority}</priority></url>`).join('\n')}
</urlset>
`

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml generated with ${routes.length} URLs`)
