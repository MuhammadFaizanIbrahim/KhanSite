import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'

const GOLD = '#D4AF37'
const ICON_STROKE = 1.6

const ICONS: Record<string, JSX.Element> = {
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  lightbulb: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.8.8-1.4 1.8-1.5 3h-5c-.1-1.2-.7-2.2-1.5-3Z" />
    </svg>
  ),
  person: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
  gear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.55 1.55M7.15 16.85l-1.55 1.55M18.4 18.4l-1.55-1.55M7.15 7.15 5.6 5.6" />
    </svg>
  ),
  flag: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4" /><path d="M5 5h11l-2.5 3.5L16 12H5" />
    </svg>
  ),
}

interface StepOption { label: string; text: string }
interface Step { icon: string; title: string; description: string; options?: StepOption[] }

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect() } },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function OptionRow({ option, isFirst }: { option: StepOption; isFirst: boolean }) {
  return (
    <div>
      {!isFirst && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.25)' }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: '0.2em', color: 'rgba(212,175,55,0.7)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.25)' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', color: GOLD, flexShrink: 0,
        }}>{option.label}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.55, color: 'rgba(237,237,237,0.75)' }}>
          {option.text}
        </span>
      </div>
    </div>
  )
}

function RealityAccordionItem({ step, index, isOpen, onToggle, inView }: {
  step: Step; index: number; isOpen: boolean; onToggle: () => void; inView: boolean
}) {
  return (
    <div style={{
      border: '1px solid rgba(212,175,55,0.35)', borderRadius: 12,
      background: 'rgba(6,6,8,0.75)', overflow: 'hidden',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 1.3s ease ${index * 80}ms, transform 1.3s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms`,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: '#0A0A0D', border: `1px solid ${GOLD}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{ICONS[step.icon] ?? ICONS.search}</div>
        <span style={{
          flex: 1, fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: 14.5, color: '#F2F2F2',
        }}><span style={{ color: GOLD }}>Step {index + 1}:</span> {step.title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div style={{
        maxHeight: isOpen ? 420 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.3s ease',
      }}>
        <div style={{ padding: '0 14px 16px 58px' }}>
          <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.6, color: 'rgba(237,237,237,0.8)' }}>
            {step.description}
          </p>
          {step.options && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              {step.options.map((o, i) => <OptionRow key={o.label} option={o} isFirst={i === 0} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type Corner = 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right'

// Popover opens away from the image edge the point sits on (below for the top
// row, above for the bottom row) and toward the image center horizontally,
// so it never runs off the section.
function popoverStyle(corner: Corner): React.CSSProperties {
  const vertical: React.CSSProperties = corner.startsWith('top')
    ? { top: 'calc(100% + 12px)' }
    : corner.startsWith('bottom')
      ? { bottom: 'calc(100% + 12px)' }
      : { top: '50%', transform: 'translateY(-50%)' }
  const horizontal: React.CSSProperties = corner.endsWith('left')
    ? { left: 0 }
    : { right: 0 }
  return { ...vertical, ...horizontal }
}

// The icon sits at the fixed anchor point (where the image's dashed guide line
// terminates); the title grows outward from it. So the icon must be the edge
// closest to the anchor: last in the row for left-side points (anchored by
// `right`), first for right-side points (anchored by `left`) — see usage below.
function RealityPoint({ step, index, corner, inView }: { step: Step; index: number; corner: Corner; inView: boolean }) {
  const side = corner.endsWith('left') ? 'left' : 'right'
  const fromX = side === 'left' ? -22 : 22

  const icon = (
    <div style={{
      position: 'relative',
      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
      background: '#0A0A0D', border: `1.5px solid ${GOLD}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 14px 2px rgba(212,175,55,0.35)',
    }}>
      {ICONS[step.icon] ?? ICONS.search}
    </div>
  )
  const title = (
    <span style={{
      fontFamily: "'Playfair Display', serif", fontWeight: 700,
      fontSize: 'clamp(12.5px, 1vw, 14.5px)', color: '#F2F2F2',
    }}><span style={{ color: GOLD }}>Step {index + 1}:</span> {step.title}</span>
  )

  return (
    <div
      className="reality-point"
      style={{
        position: 'relative',
        display: 'inline-flex',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : `translateX(${fromX}px)`,
        transition: `opacity 1.4s ease ${index * 90}ms, transform 1.4s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms`,
      }}
    >
      {/* Label — icon + "Step N: Title" heading */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        flexDirection: side === 'left' ? 'row-reverse' : 'row',
        padding: side === 'left' ? '6px 8px 6px 18px' : '6px 18px 6px 8px',
        borderRadius: 999,
        border: `1px solid ${GOLD}`, background: 'rgba(6,6,8,0.85)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        cursor: 'default', whiteSpace: 'nowrap',
      }}>
        {icon}
        {title}
      </div>

      {/* Popover — full description, shown on hover/focus */}
      <div className="reality-popover" style={{
        position: 'absolute', ...popoverStyle(corner),
        width: 270, padding: '16px 18px', borderRadius: 12,
        border: `1px solid ${GOLD}`, background: 'rgba(6,6,8,0.96)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: 20,
      }}>
        <p style={{
          margin: 0, fontFamily: "'Inter', sans-serif", fontSize: 12.5,
          lineHeight: 1.6, color: 'rgba(237,237,237,0.85)',
        }}>{step.description}</p>
        {step.options && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            {step.options.map((o, i) => <OptionRow key={o.label} option={o} isFirst={i === 0} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HowWeBringConceptsToReality() {
  const { isMobile } = useBreakpoint()
  const content = useContent('how-we-bring-concepts-to-reality')
  const [ref, inView] = useInView<HTMLDivElement>()
  const steps = content.steps as Step[]
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
      <div ref={ref} style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Heading ── */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 13, letterSpacing: '0.3em',
            color: GOLD, textTransform: 'uppercase', fontWeight: 600,
          }}>{content.eyebrow}</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 600,
            fontSize: isMobile ? 'clamp(24px, 7vw, 30px)' : 'clamp(38px, 4vw, 58px)',
            margin: '10px 0 0',
          }}>
            <span style={{ color: '#F2F2F2' }}>{content.headingWhite} </span>
            <span style={{ color: GOLD }}>{content.headingGold}</span>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 14 : 20 }}>
            <div style={{ width: isMobile ? 100 : 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6), transparent)' }} />
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14.5, lineHeight: 1.7,
            color: 'rgba(237,237,237,0.8)', maxWidth: 720, margin: '22px auto 0',
          }}>{content.intro}</p>
        </div>

        {/* ── Roundabout layout ── */}
        {isMobile ? (
          <div>
            <img
              src={content.roadmapImage}
              alt=""
              style={{ width: '100%', maxWidth: 300, display: 'block', margin: '0 auto 28px', height: 'auto' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, i) => (
                <RealityAccordionItem
                  key={step.title}
                  step={step}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(p => (p === i ? null : i))}
                  inView={inView}
                />
              ))}
            </div>
          </div>
        ) : (
          // Large roadmap graphic with the 6 step cards positioned directly on top of
          // it, at the same six spots as the icon coins baked into the image (percentage
          // positions, so it stays aligned to the image at any rendered width).
          <div style={{ position: 'relative', width: '100%', maxWidth: 1320, margin: '0 auto', aspectRatio: '1536 / 1024' }}>
            <img
              src={content.roadmapImage}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
                opacity: inView ? 1 : 0,
                transform: inView ? 'scale(1)' : 'scale(0.94)',
                transition: 'opacity 1s ease 0.1s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.1s',
              }}
            />

            {/* Positions anchor the ICON (not the pill's outer edge) to the exact spot
                where the image's dashed guide line ends — the title then grows outward
                from there, so text length never shifts the icon off the line. Left-side
                points are anchored via `right` (icon = pill's right edge), right-side
                points via `left` (icon = pill's left edge); the two rows share the same
                percentage because the artwork is left/right mirror-symmetric. */}

            {/* top-left — Initial Discovery Discussion */}
            <div style={{ position: 'absolute', top: '8%', right: '68%' }}>
              <RealityPoint step={steps[1]} index={1} corner="top-left" inView={inView} />
            </div>
            {/* top-right — Company Meeting */}
            <div style={{ position: 'absolute', top: '8%', left: '68%' }}>
              <RealityPoint step={steps[2]} index={2} corner="top-right" inView={inView} />
            </div>

            {/* mid-left — Explore Public Concepts */}
            <div style={{ position: 'absolute', top: '44%', right: '76%', transform: 'translateY(-50%)' }}>
              <RealityPoint step={steps[0]} index={0} corner="mid-left" inView={inView} />
            </div>
            {/* mid-right — Concept Design Review */}
            <div style={{ position: 'absolute', top: '44%', left: '76%', transform: 'translateY(-50%)' }}>
              <RealityPoint step={steps[3]} index={3} corner="mid-right" inView={inView} />
            </div>

            {/* bottom-left — Detailed Concept Design */}
            <div style={{ position: 'absolute', bottom: '17%', right: '70%' }}>
              <RealityPoint step={steps[4]} index={4} corner="bottom-left" inView={inView} />
            </div>
            {/* bottom-right — Company Decision */}
            <div style={{ position: 'absolute', bottom: '17%', left: '70%' }}>
              <RealityPoint step={steps[5]} index={5} corner="bottom-right" inView={inView} />
            </div>

            <style>{`
              .reality-popover {
                opacity: 0;
                visibility: hidden;
                transform: translateY(6px);
                pointer-events: none;
                transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
              }
              .reality-point:hover .reality-popover {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                pointer-events: auto;
              }
            `}</style>
          </div>
        )}
      </div>
    </section>
  )
}
