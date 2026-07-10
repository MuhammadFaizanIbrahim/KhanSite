import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'

const GOLD = '#D4AF37'
const ICON_STROKE = 1.6

const ICONS: Record<string, JSX.Element> = {
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  chat: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-4.5 7.4 8.5 8.5 0 0 1-8.9-.5L3 20l1.6-4.6a8.38 8.38 0 0 1-1.1-4.2 8.5 8.5 0 0 1 8.5-8.2h.3a8.48 8.48 0 0 1 8.5 8.3v.2Z" />
      <circle cx="8" cy="11.5" r="0.7" fill={GOLD} /><circle cx="12" cy="11.5" r="0.7" fill={GOLD} /><circle cx="16" cy="11.5" r="0.7" fill={GOLD} />
    </svg>
  ),
  document: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
      <path d="M13 2v6h6" /><path d="M7 13h4M7 17h2" />
      <path d="M20.4 14.6a1.4 1.4 0 0 1 2 2L16.4 23l-3.1.8.8-3.1Z" />
    </svg>
  ),
  handshake: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 12 4-4 4 3 3-3 4 4-3 3-4-3-3 3Z" /><path d="m14 15 3 3 5-5" />
    </svg>
  ),
}

interface Step { icon: string; title: string; description: string }

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

function TimelineRow({ step, index, isLast, inView, isMobile }: {
  step: Step; index: number; isLast: boolean; inView: boolean; isMobile: boolean
}) {
  const iconSize = isMobile ? 62 : 84
  const numberColWidth = isMobile ? 30 : 46
  const rowGap = isMobile ? 20 : 30
  const spacerMinHeight = isMobile ? 10 : 14

  const spacer = (withLine: boolean, withDot: boolean) => (
    <div style={{ position: 'relative', flex: 1, width: 1, minHeight: spacerMinHeight }}>
      {withLine && <div style={{ position: 'absolute', inset: 0, background: 'rgba(212,175,55,0.35)' }} />}
      {withDot && (
        <div style={{
          position: 'absolute', top: '100%', marginTop: rowGap / 2, left: '50%', transform: 'translate(-50%, -50%)',
          width: 5, height: 5, borderRadius: '50%', background: GOLD,
          boxShadow: '0 0 8px 2px rgba(212,175,55,0.7)',
        }} />
      )}
    </div>
  )

  return (
    <div style={{
      display: 'flex', gap: isMobile ? 10 : 16, marginBottom: isLast ? 0 : rowGap,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 1.3s ease ${index * 120}ms, transform 1.3s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
    }}>
      {/* Number + its own small underline tick — stretches to match the card's height
          (via the row below) and centers its content, lining it up with the icon. */}
      <div style={{
        flexShrink: 0, alignSelf: 'stretch', width: numberColWidth,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: isMobile ? 22 : 32, color: 'rgba(212,175,55,0.85)', lineHeight: 1,
        }}>{String(index + 1).padStart(2, '0')}</span>
        <div style={{ width: isMobile ? 16 : 20, height: 2, background: GOLD, marginTop: 6 }} />
      </div>

      {/* Icon node — vertically centered on the card via the flex column below,
          with connector line segments above/below linking to the next icon. The
          card carries no margin of its own, so this column's stretched height is
          exactly the card's height and the icon lands precisely at its middle. */}
      <div style={{ flexShrink: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {spacer(index > 0, false)}

        <div style={{
          position: 'relative', zIndex: 2, flexShrink: 0,
          width: iconSize, height: iconSize, borderRadius: '50%',
          background: '#0A0A0D', border: `1.5px solid ${GOLD}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px 2px rgba(212,175,55,0.3)',
        }}>{ICONS[step.icon] ?? ICONS.search}</div>

        {spacer(!isLast, !isLast)}
      </div>

      {/* Card — pulled left by half the icon's width so the icon's right edge sits
          exactly on the card's left border, then the extra left padding keeps the
          text clear of the icon overlapping on top of it. */}
      <div style={{
        position: 'relative', zIndex: 1, flex: 1, minWidth: 0, alignSelf: 'center',
        marginLeft: -(iconSize / 2),
        border: '1px solid rgba(212,175,55,0.3)', borderRadius: 14,
        background: 'rgba(10,10,13,0.55)',
        padding: isMobile ? `14px 16px 14px ${iconSize / 2 + 16}px` : `20px 28px 20px ${iconSize / 2 + 24}px`,
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 600,
          fontSize: isMobile ? 17 : 22, color: GOLD, margin: 0,
        }}>{step.title}</h3>
        <div style={{ width: 26, height: 2, background: GOLD, margin: isMobile ? '8px 0 10px' : '10px 0 14px' }} />
        <p style={{
          margin: 0, fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 14,
          lineHeight: 1.65, color: 'rgba(237,237,237,0.8)',
        }}>{step.description}</p>
      </div>
    </div>
  )
}

export default function HowWeBringConceptsToReality() {
  const { isMobile } = useBreakpoint()
  const content = useContent('how-we-bring-concepts-to-reality')
  const [ref, inView] = useInView<HTMLDivElement>()
  const steps = content.steps as Step[]

  return (
    <section
      id="how-we-bring-concepts-to-reality"
      style={{
        position: 'relative', width: '100%',
        backgroundColor: '#000',
        padding: isMobile ? '90px 16px 100px' : '120px 40px 140px',
        overflow: 'hidden',
      }}
    >
      <div ref={ref} style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 13, letterSpacing: '0.3em',
            color: GOLD, textTransform: 'uppercase', fontWeight: 600,
          }}>{content.eyebrow}</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 600,
            fontSize: isMobile ? 'clamp(30px, 11vw, 42px)' : 'clamp(44px, 5vw, 68px)',
            margin: '10px 0 0',
          }}>
            {content.headingWhite && <span style={{ color: '#F2F2F2' }}>{content.headingWhite} </span>}
            <span style={{ color: GOLD }}>{content.headingGold}</span>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 14 : 20 }}>
            <div style={{ width: isMobile ? 100 : 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6), transparent)' }} />
          </div>
        </div>

        {/* ── Vertical timeline ── */}
        <div>
          {steps.map((step, i) => (
            <TimelineRow
              key={step.title}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
              inView={inView}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
