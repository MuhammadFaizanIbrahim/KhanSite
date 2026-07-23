import type siteDefault from '@/content/site.json'

// The 'seo' section of site.json — this is the single editable source for
// every SEO value (titles, descriptions, keywords, social links, domain).
// Everything in this folder reads from an object shaped like this; nothing
// here hardcodes content, so a content editor updating site.json is enough —
// no code change needed.
export type SeoContent = typeof siteDefault['seo']

// Which schema.org type the page-level JSON-LD entity should use — most pages
// are a plain WebPage; the concepts listing is a CollectionPage (it's a list
// of items), and /contact is a ContactPage. Defaults to 'WebPage' when unset.
export type PageSchemaType = 'WebPage' | 'CollectionPage' | 'ContactPage'

// The props <SEO> (src/components/SEO.tsx) renders into the document head.
export interface SEOProps {
  title: string
  description: string
  image?: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
  schemaType?: PageSchemaType
}
