import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { smoothScrollTo } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'
import StarDivider from '@/components/ui/StarDivider'
import BackgroundMedia from '@/components/ui/BackgroundMedia'
import { MdKeyboardArrowDown } from 'react-icons/md'

// Background image disabled in favor of a solid black background — uncomment to restore.
// const BG_DESKTOP = "url('/images/hero%20bg%20desktop.png')"
// const BG_MOBILE  = "url('/images/hero%20bg%20mobile.png')"

// Sequential reveal steps: tagline → Opportunity → → → Concept → → → Reality → divider → scroll cue
const STEP_TAGLINE = 1
const STEP_OPP     = 2
const STEP_ARROW1  = 3
const STEP_CONCEPT = 4
const STEP_ARROW2  = 5
const STEP_REALITY = 6
const STEP_DIVIDER = 7
const STEP_SCROLL  = 8

const STEP_DELAYS_MS: Record<number, number> = {
  [STEP_TAGLINE]: 200,
  [STEP_OPP]:     750,
  [STEP_ARROW1]:  950,
  [STEP_CONCEPT]: 1150,
  [STEP_ARROW2]:  1350,
  [STEP_REALITY]: 1550,
  [STEP_DIVIDER]: 1800,
  [STEP_SCROLL]:  2050,
}

// Fires once the section scrolls into view, and again every time it re-enters
// after having scrolled away — so the reveal sequence replays on every visit.
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

// Hero mounts underneath the preloader/page-transition cover, well before it's
// actually visible on the very first load — starting the reveal sequence as
// soon as it's "in view" would finish it before the dissolve even clears. So
// the very first run additionally waits for the transition canvas to signal
// it's done; every subsequent re-entry into view (scrolling back up to Hero)
// no longer needs to wait for that, since the app has already loaded.
function useReadyForReveal() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const markReady = () => setReady(true)
    window.addEventListener('transition:done', markReady, { once: true })
    return () => window.removeEventListener('transition:done', markReady)
  }, [])
  return ready
}

function fadeStyle(active: boolean, distance = 10): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active ? 'translateY(0)' : `translateY(${distance}px)`,
    transition: 'opacity 1.6s ease, transform 1.6s cubic-bezier(0.16,1,0.3,1)',
  }
}

function ScrollCue({ label }: { label: string }) {
  const handleClick = () => {
    const current = window.__lenis?.scroll ?? window.scrollY
    smoothScrollTo(current + window.innerHeight)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <span style={{
        fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 500,
        letterSpacing: '0.35em', color: '#D4AF37', textTransform: 'uppercase',
      }}>{label}</span>

      <div style={{
        width: 20, height: 32, borderRadius: 12,
        border: '1px solid rgba(212,175,55,0.6)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: 6,
          width: 4, height: 4, borderRadius: '50%',
          background: '#D4AF37', transform: 'translateX(-50%)',
          animation: 'heroScrollDot 1.8s ease-in-out infinite',
        }} />
      </div>

      <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(212,175,55,0.55), transparent)' }} />

      <MdKeyboardArrowDown size={16} color="#D4AF37" />

      <style>{`
        @keyframes heroScrollDot {
          0%   { transform: translate(-50%, 0);    opacity: 1; }
          70%  { transform: translate(-50%, 14px);  opacity: 0; }
          100% { transform: translate(-50%, 0);    opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function Hero() {
  const { isMobile } = useBreakpoint()
  const [ref, inView] = useInView<HTMLElement>()
  const ready = useReadyForReveal()
  const step = useRevealSteps(ready && inView)
  const content = useContent('hero')
  const [wordOpp = '', wordConcept = '', wordReality = ''] = content.processWords

  return (
    <section
      id="hero"
      ref={ref}
      style={{
        position: 'relative',
        minHeight: isMobile ? '80vh' : '100vh',
        width: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      <BackgroundMedia background={content.background} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', minHeight: isMobile ? '80vh' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '120px 24px 60px' : '180px 32px 160px',
        boxSizing: 'border-box',
      }}>
      {/* ── Tagline ── */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize:   isMobile ? 'clamp(18px, 5.2vw, 24px)' : 'clamp(28px, 3vw, 46px)',
        fontWeight: 400,
        lineHeight: 1.35,
        textAlign:  'center',
        color:      '#F2F2F2',
        maxWidth:   isMobile ? 460 : 980,
        margin:     0,
        ...fadeStyle(step >= STEP_TAGLINE),
      }}>
        <RichText text={content.tagline} />
      </p>

      {/* ── Opportunity → Concept → Reality (each piece fades in in sequence) ── */}
      <div style={{
        marginTop: isMobile ? 28 : 36,
        display: 'flex', alignItems: 'center',
        gap: isMobile ? 10 : 18,
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 14,
          letterSpacing: '0.3em', color: '#D4AF37', textTransform: 'uppercase',
          ...fadeStyle(step >= STEP_OPP),
        }}>{wordOpp}</span>

        <span style={{ color: '#D4AF37', fontSize: isMobile ? 12 : 15, ...fadeStyle(step >= STEP_ARROW1) }}>&rarr;</span>

        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 14,
          letterSpacing: '0.3em', color: '#D4AF37', textTransform: 'uppercase',
          ...fadeStyle(step >= STEP_CONCEPT),
        }}>{wordConcept}</span>

        <span style={{ color: '#D4AF37', fontSize: isMobile ? 12 : 15, ...fadeStyle(step >= STEP_ARROW2) }}>&rarr;</span>

        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 14,
          letterSpacing: '0.3em', color: '#D4AF37', textTransform: 'uppercase',
          ...fadeStyle(step >= STEP_REALITY),
        }}>{wordReality}</span>
      </div>

      {/* ── Divider ── */}
      <StarDivider
        lineWidth={isMobile ? 80 : 110}
        style={{ marginTop: isMobile ? 24 : 32, ...fadeStyle(step >= STEP_DIVIDER, 0) }}
      />

      <div style={{ marginTop: isMobile ? 32 : 76, ...fadeStyle(step >= STEP_SCROLL) }}>
        <ScrollCue label={content.scrollCueLabel} />
      </div>
      </div>
    </section>
  )
}
