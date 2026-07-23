import type { SeoContent } from './types'

// Each page's target keyword list, from site.json's seo.<page>.keywords.
export function getKeywords(seo: SeoContent, page: 'home' | 'concepts' | 'contact'): string[] {
  return seo[page].keywords
}
