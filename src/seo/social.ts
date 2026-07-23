import type { SeoContent } from './types'

// The brand's social profile URLs from site.json's seo.social, as a plain
// array with any not-yet-filled-in profiles dropped — fed into the
// Organization schema's "sameAs" field (see schema.ts).
export function getSocialLinks(seo: SeoContent): string[] {
  return Object.values(seo.social).filter(Boolean)
}
