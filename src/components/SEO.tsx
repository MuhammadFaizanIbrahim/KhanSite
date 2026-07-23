import { Helmet } from 'react-helmet-async'
import { useContent } from '@/hooks/useContent'
import { buildSiteSchemaGraph, SEO_DEFAULTS, type SEOProps } from '@/seo'

export type { SEOProps }

// One reusable tag-setter used once per page. Callers build their props via
// src/seo/<page>.ts (e.g. getHomepageSEO(seo)) and spread them in — this
// component just renders title/meta/canonical/OG/Twitter tags, plus a JSON-LD
// graph (Organization + WebSite + this page's own WebPage/CollectionPage/
// ContactPage entity) built from site.json's 'seo' section and this page's
// own resolved title/description/url.
export default function SEO({ title, description, image, path, keywords, noIndex, schemaType }: SEOProps) {
  const seo = useContent('seo')
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = path ? origin + path : origin
  const resolvedImage = image ? (image.startsWith('http') ? image : origin + image) : undefined
  const schemaGraph = buildSiteSchemaGraph(seo, { type: schemaType ?? 'WebPage', url, title, description })

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={noIndex ? SEO_DEFAULTS.robotsNoIndex : SEO_DEFAULTS.robots} />
      <meta name="author" content={seo.siteName} />
      <meta name="theme-color" content={SEO_DEFAULTS.themeColor} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={SEO_DEFAULTS.ogType} />
      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}

      <meta name="twitter:card" content={resolvedImage ? SEO_DEFAULTS.twitterCardWithImage : SEO_DEFAULTS.twitterCardWithoutImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}

      <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
    </Helmet>
  )
}
