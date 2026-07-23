// Technical SEO defaults — the values a developer would change, not a content
// editor. Editable business content (titles, descriptions, keywords, social
// links, domain) lives in site.json's 'seo' section instead; see types.ts.
export const SEO_DEFAULTS = {
  ogType: 'website',
  robots: 'index, follow',
  robotsNoIndex: 'noindex, follow',
  twitterCardWithImage: 'summary_large_image',
  twitterCardWithoutImage: 'summary',
  themeColor: '#0A0A0D',
} as const
