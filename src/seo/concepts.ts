import type { Concept } from '@/data/concepts'
import type { SeoContent, SEOProps } from './types'
import { getKeywords } from './keywords'

// Resolves the /concepts listing page's <SEO> props from site.json.
export function getConceptsSEO(seo: SeoContent): SEOProps {
  return {
    title: seo.concepts.title || seo.defaultTitle,
    description: seo.concepts.description || seo.defaultDescription,
    image: seo.concepts.image || seo.defaultImage,
    keywords: getKeywords(seo, 'concepts'),
    path: '/concepts',
    schemaType: 'CollectionPage',
  }
}

// Resolves one concept's own detail-page <SEO> props — title/description
// come from that concept's own data (site.json's concepts-page.items), not
// a shared page-level default, so every concept gets a unique result.
export function getConceptDetailSEO(seo: SeoContent, concept: Concept, slug: string | undefined): SEOProps {
  return {
    title: `${seo.siteName} - ${concept.conceptName}`,
    description: concept.description,
    image: concept.image || seo.defaultImage,
    keywords: [concept.conceptName, seo.siteName, concept.industry, concept.conceptType, 'Concept Design'],
    path: `/concepts/${slug}`,
  }
}
