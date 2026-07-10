import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'

const GOLD = '#D4AF37'

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  linkedin: (
    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: GOLD, lineHeight: 1 }}>in</span>
  ),
  x: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke={GOLD} strokeWidth={1.6} />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill={GOLD} />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.6}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill={GOLD} stroke="none" />
    </svg>
  ),
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function GlowDivider({ width }: { width: number }) {
  return (
    <div style={{ position: 'relative', width, height: 1 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.75), transparent)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 6, height: 6, borderRadius: '50%',
        background: GOLD, boxShadow: '0 0 12px 3px rgba(212,175,55,0.85)',
      }} />
    </div>
  )
}

export default function Footer() {
  const { isMobile } = useBreakpoint()
  const content = useContent('footer')
  const [ref, inView] = useInView<HTMLDivElement>()

  // Background image disabled in favor of a solid black background — uncomment to restore.
  // const bg = isMobile ? "url('/images/footer%20bg%20mobile.png')" : "url('/images/footer%20bg%20desktop.png')"

  return (
    <footer id="footer" style={{
      position: 'relative', width: '100%', overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'center',
      // backgroundImage: bg,
      // backgroundSize: 'cover',
      // backgroundPosition: 'center',
      backgroundColor: '#000',
      padding: isMobile ? '130px 20px 50px' : '100px 40px 70px',
    }}>
      {/* Dark overlay so the logo, text and icons stay legible over the busy background — harmless no-op now that the background is solid black, kept so it's ready if the image is restored */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />

      <div
        ref={ref}
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: 900, margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1.6s ease, transform 1.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Top group — dividers around the heading */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GlowDivider width={isMobile ? 140 : 220} />

          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 500,
            fontSize: isMobile ? 'clamp(26px, 7.5vw, 34px)' : 'clamp(32px, 3.4vw, 48px)',
            color: '#F2F2F2', lineHeight: 1.3,
            margin: isMobile ? '22px 0' : '30px 0',
          }}>
            <div><RichText text={content.headingLine1} /></div>
            <div><RichText text={content.headingLine2} /></div>
          </h2>

          <div style={{ marginBottom: isMobile ? 0 : 64 }}>
            <GlowDivider width={isMobile ? 140 : 220} />
          </div>
        </div>

        {/* Bottom group — logo + wordmark + tagline + divider + social icons, kept together */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: isMobile ? 'clamp(48px, 14vh, 140px)' : 0,
        }}>
          <img
            src="/images/logo/logo.png"
            alt="KhanConcepts"
            style={{ width: isMobile ? 'clamp(120px, 34vw, 170px)' : 'clamp(160px, 12vw, 220px)', height: 'auto' }}
          />

          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: isMobile ? 10 : 14 }}>
            {'KhanConcepts'.split('').map((ch, i) => (
              <span key={i} style={{
                fontFamily: "'Playfair Display', serif",
                fontVariant: 'small-caps',
                fontSize: isMobile ? 'clamp(22px, 7vw, 28px)' : 'clamp(26px, 2.6vw, 34px)',
                fontWeight: 600,
                color: '#F2F2F2',
                letterSpacing: '0.01em',
                display: 'inline-block',
              }}>{ch}</span>
            ))}
          </div>

          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: isMobile ? 9 : 11,
            fontWeight: 500,
            color: GOLD,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginTop: isMobile ? 6 : 8,
          }}>{content.tagline}</span>

          <div style={{
            width: isMobile ? 220 : 320, height: 1,
            background: 'rgba(255,255,255,0.15)',
            margin: isMobile ? '22px 0 22px' : '38px 0 30px',
          }} />

          <div style={{ display: 'flex', gap: isMobile ? 12 : 16 }}>
            {Object.entries(content.social).map(([key, url]) => (
              <a
                key={key}
                href={url as string}
                target="_blank"
                rel="noreferrer"
                aria-label={key}
                style={{
                  width: isMobile ? 38 : 44, height: isMobile ? 38 : 44,
                  borderRadius: 8,
                  border: '1px solid rgba(212,175,55,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {SOCIAL_ICONS[key]}
              </a>
            ))}
          </div>

          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 11 : 12,
            color: GOLD, marginTop: isMobile ? 24 : 34,
          }}>{content.copyright}</span>
        </div>
      </div>
    </footer>
  )
}
