import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'

const BG_DESKTOP = "url('/images/hero%20bg%20desktop.png')"
const BG_MOBILE  = "url('/images/hero%20bg%20mobile.png')"

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
  return <span style={{ color: '#D4AF37' }}>{children}</span>
}

function GlowDivider({ axis, length, style }: { axis: 'horizontal' | 'vertical'; length?: number | string; style?: React.CSSProperties }) {
  const isH = axis === 'horizontal'
  return (
    <div style={{
      position: 'relative',
      width:  isH ? (length ?? '100%') : 1,
      height: isH ? 1 : (length ?? 'auto'),
      alignSelf: isH ? undefined : 'stretch',
      flexShrink: 0,
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: isH
          ? 'linear-gradient(to right, transparent, rgba(212,175,55,0.55), transparent)'
          : 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.55), transparent)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 6, height: 6, borderRadius: '50%',
        background: '#D4AF37',
        boxShadow: '0 0 10px 3px rgba(212,175,55,0.7)',
        transform: 'translate(-50%, -50%)',
      }} />
    </div>
  )
}

// Fires the section's reveal sequence once it scrolls into view
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect() } },
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
    if (!active) return
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
  const { isMobile } = useBreakpoint()
  const [ref, inView] = useInView<HTMLDivElement>()
  const step = useRevealSteps(inView)
  const content = useContent('what-is-khanconcepts')

  return (
    <section
      id="what-is-khanconcepts"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: isMobile ? BG_MOBILE : BG_DESKTOP,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '100px 24px 140px' : '120px 32px 160px',
        overflow: 'hidden',
      }}
    >
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* ── Eyebrow ── */}
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: isMobile ? 11 : 13,
          fontWeight: 500,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: '#D4AF37',
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
          <span style={{ color: '#F2F2F2' }}>{content.headingWhite}</span><Gold>{content.headingGold}</Gold>
        </h2>

        {/* ── Divider ── */}
        <div style={{ marginTop: isMobile ? 20 : 28 }}>
          <GlowDivider axis="horizontal" length={isMobile ? 160 : 260} style={fadeStyle(step >= STEP_DIVIDER, 0)} />
        </div>

        {/* ── Intro paragraphs — plain text, no bordered box ── */}
        <p style={{
          marginTop: isMobile ? 24 : 32,
          maxWidth: isMobile ? 480 : 760,
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? 15.5 : 18,
          lineHeight: 1.75,
          color: '#EDEDED',
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
            color: '#EDEDED',
            ...fadeStyle(step >= STEP_PARAGRAPH2),
          }}>
            <RichText text={content.paragraph2} />
          </p>
        )}
      </div>
    </section>
  )
}
