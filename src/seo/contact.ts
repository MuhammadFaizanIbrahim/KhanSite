import type { SeoContent, SEOProps } from './types'
import { getKeywords } from './keywords'

// Resolves the /contact page's <SEO> props from site.json.
export function getContactSEO(seo: SeoContent): SEOProps {
  return {
    title: seo.contact.title || seo.defaultTitle,
    description: seo.contact.description || seo.defaultDescription,
    image: seo.contact.image || seo.defaultImage,
    keywords: getKeywords(seo, 'contact'),
    path: '/contact',
    schemaType: 'ContactPage',
  }
}
