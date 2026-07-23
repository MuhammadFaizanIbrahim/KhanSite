import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { slugify } from '@/utils/slug'
import { getVideoEmbed, getPresentationEmbed } from '@/utils/embed'
import { RichText } from '@/utils/richText'
import SEO from '@/components/SEO'
import { getConceptDetailSEO } from '@/seo'
import Footer from '@/components/sections/Footer'
import type { Concept } from '@/data/concepts'
import { MdOutlineShare, MdKeyboardArrowDown, MdOutlineLink, MdArrowBack, MdArrowForward } from 'react-icons/md'
import { SiX, SiInstagram } from 'react-icons/si'
import { FaLinkedinIn } from 'react-icons/fa6'

const GOLD = '#D4AF37'

const ShareIcon = <MdOutlineShare size={14} color={GOLD} />
const ChevronIcon = ({ open }: { open: boolean }) => (
  <div style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
    <MdKeyboardArrowDown size={16} color={GOLD} />
  </div>
)
const LinkIcon = <MdOutlineLink size={14} color={GOLD} />
const XIcon = <SiX size={12} color={GOLD} />
const LinkedInIcon = <FaLinkedinIn size={12} color={GOLD} />
const InstagramIcon = <SiInstagram size={12} color={GOLD} />
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

function InfoBox({ title, isMobile, children }: { title: string; isMobile: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid rgba(212,175,55,0.4)', borderRadius: 16,
      background: 'rgba(10,10,13,0.6)', padding: isMobile ? '20px 18px' : '28px 34px',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 600, fontVariant: 'small-caps',
          fontSize: isMobile ? 'clamp(16px, 4.5vw, 19px)' : 'clamp(19px, 1.7vw, 24px)',
          letterSpacing: '0.04em', color: 'var(--text-gold)', margin: isMobile ? '0 0 12px' : '0 0 18px',
        }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

function SectionHeading({ isMobile, children }: { isMobile: boolean; children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif", fontWeight: 600, fontVariant: 'small-caps',
      fontSize: isMobile ? 'clamp(16px, 4.5vw, 19px)' : 'clamp(19px, 1.7vw, 24px)',
      letterSpacing: '0.04em', color: 'var(--text-gold)', margin: isMobile ? '0 0 12px' : '0 0 18px',
      textAlign: 'left',
    }}>{children}</h2>
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
  const seo = useContent('seo')
  const d = pageContent.detail
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

  const concept = (pageContent.items as Concept[]).find(c => slugify(c.conceptName) === slug)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch { /* clipboard unavailable */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    setShareOpen(false)
  }

  // Instagram has no web share-intent URL like X/LinkedIn do, so the practical
  // equivalent is copying the link for the user to paste into a bio/story/DM,
  // then handing off to Instagram itself.
  const [igCopied, setIgCopied] = useState(false)
  const shareInstagram = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch { /* clipboard unavailable */ }
    setIgCopied(true)
    setTimeout(() => setIgCopied(false), 1800)
    window.open('https://www.instagram.com/', '_blank', 'noreferrer')
    setShareOpen(false)
  }

  if (!concept) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
          {d.notFoundMessage}
        </p>
      </div>
    )
  }

  const videoEmbed = concept.conceptVideoLink ? getVideoEmbed(concept.conceptVideoLink) : null

  return (
    <div ref={scrollRef} className="fade-in" style={{ position: 'fixed', inset: 0, background: 'transparent', overflowY: 'auto', overflowX: 'hidden' }}>
      <SEO {...getConceptDetailSEO(seo, concept, slug)} />

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
          <MdArrowBack size={14} color={GOLD} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-gold)' }}>{d.backToConceptsLabel}</span>
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
            {!isMobile && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-gold)' }}>{d.shareConceptLabel}</span>}
            <ChevronIcon open={shareOpen} />
          </button>

          {shareOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: 180, zIndex: 40,
              border: `1px solid ${GOLD}`, borderRadius: 10, background: 'rgba(6,6,8,0.96)', backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            }}>
              <button onClick={copyLink} style={shareRowStyle}>{LinkIcon}<span style={shareRowTextStyle}>{copied ? d.copiedLabel : d.copyLinkLabel}</span></button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(concept.conceptName)}`}
                target="_blank" rel="noreferrer" style={shareRowStyle} onClick={() => setShareOpen(false)}
              >{XIcon}<span style={shareRowTextStyle}>{d.shareXLabel}</span></a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noreferrer" style={shareRowStyle} onClick={() => setShareOpen(false)}
              >{LinkedInIcon}<span style={shareRowTextStyle}>{d.shareLinkedInLabel}</span></a>
              <button onClick={shareInstagram} style={{ ...shareRowStyle, borderBottom: 'none' }}>
                {InstagramIcon}<span style={shareRowTextStyle}>{igCopied ? d.linkCopiedLabel : d.shareInstagramLabel}</span>
              </button>
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
            lineHeight: 1.06, margin: isMobile ? 0 : '0 0 20px', color: 'var(--text-primary)',
          }}>
            {concept.conceptName}
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
            { label: d.conceptStatusFieldLabel, value: concept.conceptStatus === 'new' ? d.newStatusValue : d.improvedStatusValue },
            { label: d.industryFieldLabel, value: concept.industry },
            { label: d.conceptTypeFieldLabel, value: concept.conceptType },
          ].map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: isMobile ? '14px 0' : '0 0 0 ' + (i === 0 ? 0 : 24) + 'px',
                borderLeft: !isMobile && i > 0 ? '1px solid rgba(212,175,55,0.6)' : 'none',
                borderBottom: isMobile && i < 2 ? '1px solid rgba(212,175,55,0.15)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-gold)', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13.5 : 14, color: 'var(--text-primary)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── Concept Overview ── */}
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1)', marginBottom: isMobile ? 16 : 22,
        }}>
          <InfoBox title="Concept Overview" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {concept.overview.map((p, i) => (
                <p key={i} style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 13.5, lineHeight: 1.65, color: 'var(--text-primary)' }}>{p}</p>
              ))}
            </div>
          </InfoBox>
        </div>

        {/* ── Concept Presentation — slide deck only, no outer box. Hidden
             entirely when this concept's showPresentation flag is false ── */}
        {concept.showPresentation !== false && (
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.4s ease 0.1s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s', marginBottom: isMobile ? 24 : 34,
        }}>
          <SectionHeading isMobile={isMobile}>Concept Presentation</SectionHeading>
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden',
            background: '#000', border: '1px solid rgba(212,175,55,0.25)',
          }}>
            {concept.embedPresentationLink ? (
              <iframe src={getPresentationEmbed(concept.embedPresentationLink)} title="Concept Presentation Slides" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
            ) : (
              <PlaceholderPane label={d.presentationPlaceholder} />
            )}
          </div>
        </div>
        )}

        {/* ── Video — separate section, own flag, no outer box ── */}
        {concept.showVideo && (
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.4s ease 0.15s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.15s', marginBottom: isMobile ? 24 : 34,
        }}>
          <SectionHeading isMobile={isMobile}>Concept Video</SectionHeading>
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
              <PlaceholderPane label={d.videoPlaceholder} />
            )}
          </div>
        </div>
        )}

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
            margin: '0 0 16px', color: 'var(--text-primary)',
          }}>
            <RichText text={d.ctaHeading} />
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12.5 : 14, lineHeight: 1.65,
            color: 'var(--text-primary)', maxWidth: 560, margin: '0 auto 26px',
          }}>
            {d.ctaParagraph}
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
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 12 : 13, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1a1206' }}>{d.ctaButtonLabel}</span>
            <MdArrowForward size={14} color="#1a1206" />
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
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
}
