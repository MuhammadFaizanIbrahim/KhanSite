import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  image?: string
  path?: string
}

// One reusable tag-setter used once per page. Values are resolved by the
// caller (site.json field, with its own fallback already applied) — this
// component just renders them as title/meta/canonical/OG/Twitter tags.
export default function SEO({ title, description, image, path }: SEOProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = path ? origin + path : origin
  const resolvedImage = image ? (image.startsWith('http') ? image : origin + image) : undefined

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}

      <meta name="twitter:card" content={resolvedImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
    </Helmet>
  )
}
