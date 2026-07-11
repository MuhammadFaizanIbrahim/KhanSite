import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import StarDivider from '@/components/ui/StarDivider'
import BackgroundMedia from '@/components/ui/BackgroundMedia'
import { MdOutlineAutoAwesome, MdTrendingUp, MdChevronLeft, MdChevronRight, MdArrowForward } from 'react-icons/md'

const GOLD = '#D4AF37'

const BADGE_ICONS: Record<string, JSX.Element> = {
  sparkle: <MdOutlineAutoAwesome size={12} color={GOLD} />,
  trend: <MdTrendingUp size={12} color={GOLD} />,
}

interface FeaturedTag { icon: string; text: string }
interface FeaturedItem {
  image: string
  badge: string
  badgeIcon: 'sparkle' | 'trend'
  titleWhite: string
  titleGold: string
  tags: FeaturedTag[]
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return dir === 'left' ? <MdChevronLeft size={22} color={GOLD} /> : <MdChevronRight size={22} color={GOLD} />
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
      draggable={false}
      onError={() => setFailed(true)}
      style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
    />
  )
}

function FeaturedCard({ item, cardWidth, isActive }: { item: FeaturedItem; cardWidth: number; isActive: boolean }) {
  return (
    <div style={{
      width: cardWidth,
      borderRadius: 18,
      overflow: 'hidden',
      background: 'rgba(10,10,13,0.75)',
      border: `1px solid ${isActive ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.25)'}`,
      boxShadow: isActive ? '0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(212,175,55,0.12)' : '0 10px 30px rgba(0,0,0,0.45)',
    }}>
      <div style={{ position: 'relative' }}>
        <CardImage src={item.image} alt={`${item.titleWhite} ${item.titleGold}`} />
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(6,6,8,0.78)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(212,175,55,0.5)', borderRadius: 20, padding: '5px 11px',
        }}>
          {BADGE_ICONS[item.badgeIcon]}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, color: GOLD, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            {item.badge}
          </span>
        </div>
      </div>

      <div style={{ padding: '18px 22px 22px' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(20px, 2vw, 25px)', margin: 0, lineHeight: 1.2 }}>
          <span style={{ color: '#F2F2F2' }}>{item.titleWhite} </span>
          <span style={{ color: GOLD }}>{item.titleGold}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
          {item.tags.map(tag => (
            <span key={tag.text} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: 'rgba(237,237,237,0.78)' }}>{tag.text}</span>
          ))}
        </div>

        <div style={{ marginTop: 16, marginBottom: 14, height: 1, background: 'linear-gradient(to right, rgba(212,175,55,0.4), transparent)' }} />

        <Link to="/concepts" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 500, color: GOLD }}>Explore Concept</span>
          <MdArrowForward size={14} color={GOLD} />
        </Link>
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

function GlowRing({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: isMobile ? 20 : 34,
      transform: 'translateX(-50%)', width: '94%', maxWidth: 1100,
      height: isMobile ? 32 : 64, pointerEvents: 'none',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <ellipse cx="500" cy="50" rx="480" ry="34" fill="none" stroke="rgba(212,175,55,0.22)" strokeWidth="16" style={{ filter: 'blur(8px)' }} />
        <ellipse cx="500" cy="50" rx="480" ry="34" fill="none" stroke="rgba(212,175,55,0.55)" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export default function FeaturedConcepts() {
  const { isMobile, width } = useBreakpoint()
  const content = useContent('featured-concepts')
  const [sectionRef, inView] = useInView<HTMLDivElement>()
  const [active, setActive] = useState(0)
  const touchX = useRef<number | null>(null)

  const items = content.items as FeaturedItem[]
  const count = items.length

  const goTo = (i: number) => setActive(((i % count) + count) % count)
  const next = () => goTo(active + 1)
  const prev = () => goTo(active - 1)

  const cardWidth = isMobile
    ? Math.min(width * 0.6, 250)
    : Math.min(Math.max(width * 0.24, 260), 380)

  const stageHeight = cardWidth * 0.75 + (isMobile ? 168 + 46 : 208 + 60)
  const cardsTopOffset = isMobile ? -10 : -18
  // Distance from center to place the arrows just past the visible side cards,
  // instead of pinned to the far edges of the whole section.
  const arrowInset = cardWidth * 1.35 + 40

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev())
    touchX.current = null
  }

  return (
    <section
      id="featured-concepts"
      style={{
        position: 'relative', width: '100%', overflow: 'hidden',
        backgroundColor: '#000',
        padding: isMobile ? '90px 0 90px' : '120px 0 150px',
      }}
    >
      <BackgroundMedia background={content.background} />

      <div ref={sectionRef} style={{ position: 'relative', zIndex: 1, maxWidth: 1440, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{
          textAlign: 'center', marginBottom: isMobile ? 40 : 70, padding: '0 20px',
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.5s ease, transform 1.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 600,
            fontSize: isMobile ? 'clamp(24px, 7vw, 30px)' : 'clamp(34px, 3.6vw, 52px)',
            margin: 0, lineHeight: 1.25,
          }}>
            <span style={{ color: '#F2F2F2' }}>{content.headingWhite} </span>
            <span style={{ color: GOLD }}>{content.headingGold}</span>
          </h2>
          <StarDivider lineWidth={isMobile ? 50 : 100} style={{ marginTop: isMobile ? 14 : 20 }} />
        </div>

        {/* Carousel stage */}
        <div
          data-cursor="drag"
          style={{ position: 'relative', height: stageHeight, opacity: inView ? 1 : 0, transition: 'opacity 1.6s ease 0.15s', perspective: 1400 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <GlowRing isMobile={isMobile} />

          {!isMobile && (
            <>
              <button
                aria-label="Previous concept"
                onClick={prev}
                style={{
                  position: 'absolute', left: `calc(50% - ${arrowInset}px)`, top: '38%', transform: 'translateY(-50%)', zIndex: 10,
                  width: 42, height: 42, borderRadius: '50%', background: 'rgba(10,10,13,0.7)',
                  border: '1px solid rgba(212,175,55,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ><ChevronIcon dir="left" /></button>
              <button
                aria-label="Next concept"
                onClick={next}
                style={{
                  position: 'absolute', right: `calc(50% - ${arrowInset}px)`, top: '38%', transform: 'translateY(-50%)', zIndex: 10,
                  width: 42, height: 42, borderRadius: '50%', background: 'rgba(10,10,13,0.7)',
                  border: '1px solid rgba(212,175,55,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ><ChevronIcon dir="right" /></button>
            </>
          )}

          <div style={{
            position: 'absolute', left: '50%', top: cardsTopOffset,
            width: cardWidth, marginLeft: -cardWidth / 2,
          }}>
            {items.map((item, i) => {
              let diff = i - active
              if (diff > count / 2) diff -= count
              if (diff < -count / 2) diff += count

              const isActive = diff === 0
              const visible = Math.abs(diff) <= 1

              const gapX = cardWidth * (isMobile ? 0.6 : 0.72)
              const translateX = diff * gapX
              const scale = isActive ? 1 : 0.82
              const rotateY = isActive ? 0 : -diff * 26
              const opacity = !visible ? 0 : isActive ? 1 : 0.82
              const z = 10 - Math.abs(diff)

              return (
                <div
                  key={item.titleWhite + item.titleGold}
                  data-cursor={isActive ? undefined : 'select'}
                  style={{
                    position: 'absolute', left: 0, top: 0,
                    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    zIndex: z,
                    pointerEvents: visible ? 'auto' : 'none',
                    transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease',
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={() => !isActive && goTo(i)}
                >
                  <FeaturedCard item={item} cardWidth={cardWidth} isActive={isActive} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Dots + mobile arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: isMobile ? 22 : 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {items.map((item, i) => (
              <button
                key={item.titleWhite + item.titleGold}
                aria-label={`Go to concept ${i + 1}`}
                onClick={() => goTo(i)}
                style={{
                  width: i === active ? 22 : 8, height: 8, borderRadius: 4,
                  background: i === active ? GOLD : 'rgba(255,255,255,0.25)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', padding: 0,
                }}
              />
            ))}
          </div>

          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <button
                aria-label="Previous concept"
                onClick={prev}
                style={{
                  width: 42, height: 42, borderRadius: '50%', background: 'rgba(10,10,13,0.7)',
                  border: '1px solid rgba(212,175,55,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ><ChevronIcon dir="left" /></button>
              <button
                aria-label="Next concept"
                onClick={next}
                style={{
                  width: 42, height: 42, borderRadius: '50%', background: 'rgba(10,10,13,0.7)',
                  border: '1px solid rgba(212,175,55,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ><ChevronIcon dir="right" /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
