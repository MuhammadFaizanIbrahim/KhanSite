import type { PageSchemaType, SeoContent } from './types'
import { getSocialLinks } from './social'

// Organization JSON-LD — read by search engines to understand the business
// (name, official site, logo, social profiles). All values come from
// site.json's 'seo' section, so updating the domain, logo, or social links
// there is enough — no code change needed. Nested under buildSiteSchemaGraph's
// "@graph" below, so it doesn't carry its own "@context".
export function buildOrganizationSchema(seo: SeoContent) {
  const logoUrl = seo.logo.startsWith('http') ? seo.logo : seo.domain + seo.logo
  const sameAs = getSocialLinks(seo)

  return {
    '@type': 'Organization',
    name: seo.siteName,
    url: seo.domain,
    logo: logoUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

// WebSite JSON-LD — represents the site as a whole, distinct from the
// Organization that runs it. Doesn't vary per page.
export function buildWebSiteSchema(seo: SeoContent) {
  return {
    '@type': 'WebSite',
    name: seo.siteName,
    url: seo.domain,
  }
}

// The current page as its own schema.org entity — CollectionPage for the
// concepts listing, ContactPage for /contact, plain WebPage everywhere else.
export function buildWebPageSchema(
  seo: SeoContent,
  page: { type: PageSchemaType; url: string; title: string; description: string }
) {
  return {
    '@type': page.type,
    name: page.title,
    description: page.description,
    url: page.url,
    isPartOf: { '@type': 'WebSite', name: seo.siteName, url: seo.domain },
  }
}

// Combines all three into one JSON-LD block via "@graph" — the standard way
// to describe multiple related entities in a single <script> tag instead of
// repeating "@context" three times. This is what <SEO> actually renders.
export function buildSiteSchemaGraph(
  seo: SeoContent,
  page: { type: PageSchemaType; url: string; title: string; description: string }
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(seo),
      buildWebSiteSchema(seo),
      buildWebPageSchema(seo, page),
    ],
  }
}
