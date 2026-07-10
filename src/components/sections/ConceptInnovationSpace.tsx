import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'

const ICON_STROKE = 1.6
const GOLD = '#D4AF37'

// Icon is chosen per card via a key in site.json ("icon": "search" etc.) — the
// actual glyphs live here since they're a design concern, not editable content.
const ICONS: Record<string, JSX.Element> = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  chip: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="1.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  ),
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V3Z" />
      <path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V3Z" />
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  car: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="5" rx="1.5" /><circle cx="7" cy="18.5" r="1.5" /><circle cx="17" cy="18.5" r="1.5" />
    </svg>
  ),
  flask: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6M10 2v6.5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V2" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </svg>
  ),
  gamepad: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 11h4M8 9v4" /><circle cx="16.5" cy="10.5" r="0.9" fill={GOLD} /><circle cx="18.5" cy="12.5" r="0.9" fill={GOLD} />
      <rect x="2" y="7" width="20" height="11" rx="5.5" />
    </svg>
  ),
}

interface ConceptItem {
  icon: string
  image: string
  title: string
  bullets: string[]
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div style={{
        width: '100%', aspectRatio: '4 / 3',
        background: 'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.14) 0%, rgba(10,10,13,0.9) 70%)',
      }} />
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
    />
  )
}

function ConceptCard({ item, delay, inView, isMobile }: { item: ConceptItem; delay: number; inView: boolean; isMobile: boolean }) {
  const iconSize   = isMobile ? 34 : 44
  const iconOffset = isMobile ? -18 : -26

  return (
    <div style={{
      border: '1px solid rgba(212,175,55,0.35)',
      borderRadius: isMobile ? 12 : 16,
      overflow: 'hidden',
      background: 'rgba(10,10,13,0.6)',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 1.5s ease ${delay}ms, transform 1.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      <CardImage src={item.image} alt={item.title} />

      {/* Icon + title on one row, right where the image meets the body.
          Only the icon is visually shifted upward (via its own relative offset)
          to overlap the image — this doesn't affect the row's layout, so the
          title stays correctly placed beside it, never dragged into the image. */}
      <div style={{ padding: isMobile ? '3px 10px 0' : '4px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          <div style={{
            position: 'relative', top: iconOffset, zIndex: 2,
            width: iconSize, height: iconSize, borderRadius: '50%', flexShrink: 0,
            background: '#0A0A0D', border: `1px solid ${GOLD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {ICONS[item.icon] ?? ICONS.search}
          </div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 14.5 : 'clamp(17px, 1.7vw, 21px)',
            fontWeight: 600, color: GOLD, lineHeight: 1.25,
          }}>{item.title}</span>
        </div>

        <div style={{ marginTop: isMobile ? 10 : 14, height: 1, background: 'linear-gradient(to right, rgba(212,175,55,0.5), transparent)' }} />

        {/* Bullets */}
        <ul style={{ listStyle: 'none', margin: 0, padding: isMobile ? '10px 0 16px' : '14px 0 22px', display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 9 }}>
          {item.bullets.map(b => (
            <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 7 : 10 }}>
              <span style={{
                marginTop: isMobile ? 6 : 7, width: 5, height: 5, borderRadius: '50%',
                background: GOLD, flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 11.5 : 13.5,
                lineHeight: isMobile ? 1.4 : 1.5,
                color: 'rgba(237,237,237,0.85)',
              }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
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

export default function ConceptInnovationSpace() {
  const { isMobile } = useBreakpoint()
  const content = useContent('concept-innovation-space')
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <section
      id="concept-innovation-space"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        padding: isMobile ? '90px 16px 100px' : '120px 40px 140px',
      }}
    >
      <div ref={ref} style={{ maxWidth: 1360, margin: '0 auto' }}>

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 26 : 60 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            fontSize: isMobile ? 'clamp(20px, 6.5vw, 26px)' : 'clamp(38px, 4vw, 60px)',
            margin: 0,
          }}>
            <span style={{ color: '#F2F2F2' }}>{content.headingWhite1} </span>
            <span style={{ color: GOLD }}>{content.headingGold} </span>
            <span style={{ color: '#F2F2F2' }}>{content.headingWhite2}</span>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 10 : 16 }}>
            <div style={{ width: isMobile ? 120 : 220, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6), transparent)' }} />
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14.5, lineHeight: 1.7,
            color: 'rgba(237,237,237,0.8)', maxWidth: 720, margin: '22px auto 0',
          }}><RichText text={content.intro} /></p>
        </div>


        {/* ── Grid: 2 columns mobile, 4 columns desktop ── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: isMobile ? 10 : 22 }}>
          {content.items.map((item, i) => (
            <ConceptCard key={item.title} item={item} inView={inView} delay={i * 70} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  )
}
