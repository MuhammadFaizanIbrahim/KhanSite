// Normalizes whatever URL a client pastes into "video" or "slideEmbed" (a
// plain YouTube/Vimeo link, a direct video file, or a Canva/Google Slides/
// Google Drive share link) into something actually embeddable.

export function getVideoEmbed(url: string): { kind: 'iframe' | 'video'; src: string } {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (youtube) return { kind: 'iframe', src: `https://www.youtube.com/embed/${youtube[1]}` }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` }

  // Anything else is assumed to be a direct video file (.mp4 etc.) or an
  // already-embeddable URL — play it natively.
  return { kind: 'video', src: url }
}

export function getPresentationEmbed(url: string): string {
  const slides = url.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/)
  if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false&delayms=3000`

  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`

  const canva = url.match(/canva\.com\/design\/([\w-]+)\/([\w-]+)/)
  if (canva) return `https://www.canva.com/design/${canva[1]}/${canva[2]}/view?embed`

  // Already an embed URL (or some other host that just works as an iframe src).
  return url
}
