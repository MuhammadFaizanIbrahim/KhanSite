import type { SeoContent, SEOProps } from './types'
import { getKeywords } from './keywords'

// Resolves the homepage's <SEO> props from site.json — falls back to the
// shared default image if seo.home.image is left blank.
export function getHomepageSEO(seo: SeoContent): SEOProps {
  return {
    title: seo.home.title,
    description: seo.home.description,
    image: seo.home.image || seo.defaultImage,
    keywords: getKeywords(seo, 'home'),
    path: '/',
  }
}
