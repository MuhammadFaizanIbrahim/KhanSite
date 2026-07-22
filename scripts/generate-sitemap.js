// Regenerates public/sitemap.xml from src/content/site.json's concept list,
// so it never goes stale as concepts are added/removed/renamed. Runs
// automatically as a "prebuild" step (see package.json) — no manual step needed.
const fs = require('fs')
const path = require('path')

// Update once the production domain is finalized (Vercel now, Cloudflare/
// custom domain later) — or set SITE_URL as a build-time env var to override.
const SITE_URL = process.env.SITE_URL || 'https://khan-site.vercel.app'

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

const staticRoutes = ['/', '/concepts', '/contact']
const conceptRoutes = site['concepts-page'].items.map(
  item => `/concepts/${slugify(item.conceptName)}`
)

const urls = [...staticRoutes, ...conceptRoutes]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml generated with ${urls.length} URLs`)
