export interface BackgroundConfig {
  // Widened to `string` rather than a union — site.json's imported types
  // widen plain string fields, so the valid values ("none" | "image" | "video")
  // are enforced at runtime below instead of statically.
  type: string
  image?: string
  video?: string
}

// Renders a section's configurable background — a still image, a looping
// muted video, or nothing at all (letting the section's own black background
// show through). Driven entirely by site.json so a non-technical client can
// switch a section between "no media" / "image" / "video" themselves.
export default function BackgroundMedia({ background }: { background: BackgroundConfig }) {
  if (!background) return null

  if (background.type === 'video' && background.video) {
    return (
      <video
        autoPlay muted loop playsInline
        src={background.video}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />
    )
  }

  if (background.type === 'image' && background.image) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url('${background.image}')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
    )
  }

  return null
}
