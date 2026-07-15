import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'
import StarDivider from '@/components/ui/StarDivider'
import BackgroundMedia from '@/components/ui/BackgroundMedia'

// Background image disabled in favor of a solid black background — uncomment to restore.
// const BG_DESKTOP = "url('/images/hero%20bg%20desktop.png')"
// const BG_MOBILE  = "url('/images/hero%20bg%20mobile.png')"

// Sequential reveal: eyebrow → heading → divider → paragraph 1 → paragraph 2
const STEP_EYEBROW    = 1
const STEP_HEADING    = 2
const STEP_DIVIDER    = 3
const STEP_PARAGRAPH1 = 4
const STEP_PARAGRAPH2 = 5

const STEP_DELAYS_MS: Record<number, number> = {
  [STEP_EYEBROW]:    100,
  [STEP_HEADING]:    350,
  [STEP_DIVIDER]:    650,
  [STEP_PARAGRAPH1]: 900,
  [STEP_PARAGRAPH2]: 1150,
}

function Gold({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--text-gold)' }}>{children}</span>
}

// Fires the section's reveal sequence every time it scrolls into view — and
// again on every re-entry after having scrolled away, so it always replays.
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function useRevealSteps(active: boolean) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!active) { setStep(0); return }
    const timers = Object.entries(STEP_DELAYS_MS).map(([s, ms]) =>
      setTimeout(() => setStep(Number(s)), ms)
    )
    return () => timers.forEach(clearTimeout)
  }, [active])
  return step
}

function fadeStyle(active: boolean, distance = 14): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active ? 'translateY(0)' : `translateY(${distance}px)`,
    transition: 'opacity 1.6s ease, transform 1.6s cubic-bezier(0.16,1,0.3,1)',
  }
}

export default function WhatIsKhanConcepts() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionMinHeight = isMobile ? '72vh' : isTablet ? '85vh' : '100vh'
  const [ref, inView] = useInView<HTMLDivElement>()
  const step = useRevealSteps(inView)
  const content = useContent('what-is-khanconcepts')

  return (
    <section
      id="what-is-khanconcepts"
      style={{
        position: 'relative',
        minHeight: sectionMinHeight,
        width: '100%',
        // backgroundImage: isMobile ? BG_MOBILE : BG_DESKTOP,
        // backgroundSize: 'cover',
        // backgroundPosition: 'center',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '50px 24px 50px' : '120px 32px 160px',
        overflow: 'hidden',
      }}
    >
      <BackgroundMedia background={content.background} />

      <div ref={ref} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* ── Eyebrow ── */}
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: isMobile ? 11 : 18,
          fontWeight: 500,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--text-gold)',
          ...fadeStyle(step >= STEP_EYEBROW),
        }}>{content.eyebrow}</span>

        {/* ── Heading ── */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontVariant: 'small-caps',
          fontWeight: 600,
          fontSize: isMobile ? 'clamp(34px, 11vw, 52px)' : 'clamp(52px, 6vw, 92px)',
          lineHeight: 1,
          margin: isMobile ? '10px 0 0' : '14px 0 0',
          textAlign: 'center',
          ...fadeStyle(step >= STEP_HEADING),
        }}>
          <span style={{ color: 'var(--text-primary)' }}>{content.headingWhite}</span><Gold>{content.headingGold}</Gold>
        </h2>

        {/* ── Divider ── */}
        <StarDivider
          lineWidth={isMobile ? 80 : 130}
          style={{ marginTop: isMobile ? 20 : 28, ...fadeStyle(step >= STEP_DIVIDER, 0) }}
        />

        {/* ── Intro paragraphs — plain text, no bordered box ── */}
        <p style={{
          marginTop: isMobile ? 24 : 32,
          maxWidth: isMobile ? 480 : 760,
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 15.5 : 18,
          lineHeight: 1.75,
          color: 'var(--text-primary)',
          ...fadeStyle(step >= STEP_PARAGRAPH1),
        }}>
          <RichText text={content.paragraph1} />
        </p>

        {content.paragraph2 && (
          <p style={{
            marginTop: isMobile ? 18 : 22,
            maxWidth: isMobile ? 480 : 760,
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: isMobile ? 15.5 : 18,
            lineHeight: 1.75,
            color: 'var(--text-primary)',
            ...fadeStyle(step >= STEP_PARAGRAPH2),
          }}>
            <RichText text={content.paragraph2} />
          </p>
        )}
      </div>
    </section>
  )
}
