import type { SeoContent, SEOProps } from './types'
import { getKeywords } from './keywords'

// Resolves the homepage's <SEO> props from site.json — falls back to the
// shared defaults if seo.home.title/description/image are left blank.
export function getHomepageSEO(seo: SeoContent): SEOProps {
  return {
    title: seo.home.title || seo.defaultTitle,
    description: seo.home.description || seo.defaultDescription,
    image: seo.home.image || seo.defaultImage,
    keywords: getKeywords(seo, 'home'),
    path: '/',
  }
}
