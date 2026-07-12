import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'
import StarDivider from '@/components/ui/StarDivider'
import BackgroundMedia from '@/components/ui/BackgroundMedia'

const GOLD = '#D4AF37'

interface ConceptItem {
  icon: string
  image: string
  title: string
  bullets: string[]
}

// Playfair Display's swash "&" glyph looks out of place amid an otherwise
// plain title, so that one character is rendered in a simple sans-serif font.
function renderTitle(title: string) {
  return title.split(/(&)/).map((part, i) =>
    part === '&' ? <span key={i} style={{ fontFamily: "'Inter', sans-serif" }}>&amp;</span> : part
  )
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

      <div style={{ padding: isMobile ? '14px 10px 0' : '18px 18px 0' }}>
        <span style={{
          display: 'block', textAlign: 'left',
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? 14.5 : 'clamp(17px, 1.7vw, 21px)',
          fontWeight: 600, color: GOLD, lineHeight: 1.25,
        }}>{renderTitle(item.title)}</span>

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
                color: 'var(--text-primary)',
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
      <BackgroundMedia background={content.background} />

      <div ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 1360, margin: '0 auto' }}>

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 26 : 60 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            fontSize: isMobile ? 'clamp(20px, 6.5vw, 26px)' : 'clamp(38px, 4vw, 60px)',
            margin: 0,
          }}>
            <span style={{ color: 'var(--text-primary)' }}>{content.headingWhite1} </span>
            <span style={{ color: GOLD }}>{content.headingGold} </span>
            <span style={{ color: 'var(--text-primary)' }}>{content.headingWhite2}</span>
          </h2>
          <StarDivider lineWidth={isMobile ? 60 : 110} style={{ marginTop: isMobile ? 10 : 16 }} />
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14.5, lineHeight: 1.7,
            color: 'var(--text-primary)', maxWidth: 720, margin: '22px auto 0',
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
