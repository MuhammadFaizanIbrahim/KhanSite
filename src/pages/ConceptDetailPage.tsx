import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { slugify } from '@/utils/slug'
import { getVideoEmbed, getPresentationEmbed } from '@/utils/embed'
import Footer from '@/components/sections/Footer'
import type { Concept } from '@/data/concepts'

const GOLD = '#D4AF37'
const ICON_STROKE = 1.6

const ShareIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4" />
  </svg>
)
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
const LinkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1.5 1.5" />
    <path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1.5-1.5" />
  </svg>
)
const XIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
)
const LinkedInIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={GOLD}>
    <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.7c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.19 1.48-2.19 3v5.8H9z" />
  </svg>
)
const CalendarIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A0A0D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)
const DocumentIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
  </svg>
)
const FilmIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 4v5M16 4v5" />
  </svg>
)
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.08 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function InfoBox({ icon, title, isMobile, children }: { icon: JSX.Element; title: string; isMobile: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid rgba(212,175,55,0.4)', borderRadius: 16,
      background: 'rgba(10,10,13,0.6)', padding: isMobile ? '20px 18px' : '28px 34px',
      display: 'flex', gap: isMobile ? 16 : 28, alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0, width: isMobile ? 46 : 0, height: isMobile ? 46 : 0,
        borderRadius: '50%', border: isMobile ? `1px solid ${GOLD}` : 'none',
        background: isMobile ? 'rgba(212,175,55,0.08)' : 'none',
        display: isMobile ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 600, fontVariant: 'small-caps',
          fontSize: isMobile ? 'clamp(16px, 4.5vw, 19px)' : 'clamp(19px, 1.7vw, 24px)',
          letterSpacing: '0.04em', color: GOLD, margin: isMobile ? '0 0 12px' : '0 0 18px',
        }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

function PlaceholderPane({ label }: { label: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(212,175,55,0.06)',
    }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, letterSpacing: '0.08em', color: 'rgba(212,175,55,0.6)' }}>{label}</span>
    </div>
  )
}

export default function ConceptDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile } = useBreakpoint()
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ref, inView] = useInView<HTMLDivElement>()
  const pageContent = useContent('concepts-page')
  const shareRef = useRef<HTMLDivElement>(null)

  // Clicking anywhere outside the share menu closes it (covers the click-to-open
  // case — the hover-to-open case is already handled by onMouseLeave below).
  useEffect(() => {
    if (!shareOpen) return
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [shareOpen])

  const concept = (pageContent.items as Concept[]).find(c => slugify(c.title) === slug)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch { /* clipboard unavailable */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    setShareOpen(false)
  }

  if (!concept) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#fff', letterSpacing: '0.08em' }}>
          Concept not found.
        </p>
      </div>
    )
  }

  const videoEmbed = concept.video ? getVideoEmbed(concept.video) : null

  return (
    <div ref={scrollRef} className="fade-in" style={{ position: 'fixed', inset: 0, background: '#000', overflowY: 'auto', overflowX: 'hidden' }}>

      <div style={{ position: 'relative', zIndex: 2 }}>

      {/* ── Back + Share, on one line beneath the universal site logo ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '90px 16px 0' : '120px 40px 0',
      }}>
        <button
          onClick={() => triggerPageOut(() => navigate('/concepts'))}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round"><path d="M9 6H3M5 4L3 6l2 2" /></svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD }}>Back to Concepts</span>
        </button>

        <div
          ref={shareRef}
          style={{ position: 'relative', paddingBottom: 8 }}
          onMouseEnter={() => setShareOpen(true)}
          onMouseLeave={() => setShareOpen(false)}
        >
          <button
            onClick={() => setShareOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '9px 12px' : '10px 16px',
              border: `1px solid ${GOLD}`, borderRadius: 999, background: 'rgba(10,10,13,0.5)', cursor: 'pointer',
            }}
          >
            {ShareIcon}
            {!isMobile && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', color: GOLD }}>SHARE CONCEPT</span>}
            <ChevronIcon open={shareOpen} />
          </button>

          {shareOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: 180, zIndex: 40,
              border: `1px solid ${GOLD}`, borderRadius: 10, background: 'rgba(6,6,8,0.96)', backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            }}>
              <button onClick={copyLink} style={shareRowStyle}>{LinkIcon}<span style={shareRowTextStyle}>{copied ? 'Copied!' : 'Copy Link'}</span></button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(concept.title)}`}
                target="_blank" rel="noreferrer" style={shareRowStyle} onClick={() => setShareOpen(false)}
              >{XIcon}<span style={shareRowTextStyle}>Share on X</span></a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noreferrer" style={shareRowStyle} onClick={() => setShareOpen(false)}
              >{LinkedInIcon}<span style={shareRowTextStyle}>Share on LinkedIn</span></a>
            </div>
          )}
        </div>
      </div>

      <div ref={ref} style={{ maxWidth: 1360, margin: '0 auto', padding: isMobile ? '16px 16px 60px' : '20px 40px 90px' }}>

        {/* ── Concept Name — the page background is the concept's own image ── */}
        <div style={{ maxWidth: isMobile ? '100%' : 640, marginBottom: isMobile ? 8 : 0 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700, textTransform: 'uppercase',
            fontSize: isMobile ? 'clamp(26px, 8.5vw, 34px)' : 'clamp(38px, 5vw, 60px)',
            lineHeight: 1.06, margin: isMobile ? 0 : '0 0 20px', color: GOLD,
          }}>
            {concept.title}
          </h1>
        </div>

        {/* ── Meta row ── */}
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '1fr 1fr 1fr',
          gap: isMobile ? 0 : 24,
          margin: isMobile ? '22px 0 26px' : '34px 0 40px',
        }}>
          {[
            { label: 'Concept Status', value: concept.status === 'new' ? 'New' : 'Improved' },
            { label: 'Industry', value: concept.space },
            { label: 'Concept Type', value: concept.type },
          ].map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: isMobile ? '14px 0' : '0 0 0 ' + (i === 0 ? 0 : 24) + 'px',
                borderLeft: !isMobile && i > 0 ? '1px solid rgba(212,175,55,0.2)' : 'none',
                borderBottom: isMobile && i < 2 ? '1px solid rgba(212,175,55,0.15)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13.5 : 14, color: '#F2F2F2' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── Concept Overview ── */}
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1)', marginBottom: isMobile ? 16 : 22,
        }}>
          <InfoBox icon={DocumentIcon} title="Concept Overview" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {concept.overview.map((p, i) => (
                <p key={i} style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 13.5, lineHeight: 1.65, color: 'rgba(237,237,237,0.85)' }}>{p}</p>
              ))}
            </div>
          </InfoBox>
        </div>

        {/* ── Concept Presentation — video + slide deck ── */}
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.4s ease 0.1s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s', marginBottom: isMobile ? 24 : 34,
        }}>
          <InfoBox icon={FilmIcon} title="Concept Presentation" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 22 }}>
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden',
                background: '#000', border: '1px solid rgba(212,175,55,0.25)',
              }}>
                {concept.slideEmbed ? (
                  <iframe src={getPresentationEmbed(concept.slideEmbed)} title="Concept Presentation Slides" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
                ) : (
                  <PlaceholderPane label="Presentation coming soon" />
                )}
              </div>

              <div style={{
                position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden',
                background: '#000', border: '1px solid rgba(212,175,55,0.25)',
              }}>
                {videoEmbed ? (
                  videoEmbed.kind === 'iframe' ? (
                    <iframe src={videoEmbed.src} title="Concept Video" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
                  ) : (
                    <video controls poster={concept.image} src={videoEmbed.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <PlaceholderPane label="Video coming soon" />
                )}
              </div>
            </div>
          </InfoBox>
        </div>

        {/* ── CTA ── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          border: `1px solid ${GOLD}`, borderRadius: 18,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12), rgba(10,10,13,0.85) 60%)',
          padding: isMobile ? '32px 20px' : '48px 40px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700,
            fontSize: isMobile ? 'clamp(22px, 7vw, 28px)' : 'clamp(28px, 3vw, 40px)',
            margin: '0 0 16px',
          }}>
            <span style={{ color: '#F2F2F2' }}>Interested in </span>
            <span style={{ color: GOLD }}>This Concept?</span>
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 14, lineHeight: 1.65,
            color: 'rgba(237,237,237,0.82)', maxWidth: 560, margin: '0 auto 26px',
          }}>
            Schedule a Concept Discussion to explore how this Concept Design can be tailored to your company's goals and requirements.
          </p>
          <button
            onClick={() => triggerPageOut(() => navigate('/contact'))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12, padding: isMobile ? '13px 24px' : '15px 32px',
              borderRadius: 999, border: `1px solid ${GOLD}`,
              background: 'linear-gradient(90deg, #B8860B, #D4AF37 50%, #F0CB63 80%, #D4AF37)',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(10,10,13,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{CalendarIcon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12 : 13, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1a1206' }}>Schedule a Concept Discussion</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1206" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  )
}

const shareRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px',
  background: 'transparent', border: 'none', borderBottom: '1px solid rgba(212,175,55,0.15)',
  cursor: 'pointer', textDecoration: 'none', textAlign: 'left',
}
const shareRowTextStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: '#F2F2F2',
}
