import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { PROJECTS } from '@/data/projects'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLenis } from '@/hooks/useLenis'
import Footer from '@/components/sections/Footer'
import { MdArrowBack } from 'react-icons/md'

const label = (text: string) => ({
  fontFamily: 'Manrope, sans-serif' as const,
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-primary)',
  margin: '0 0 10px',
})

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile } = useBreakpoint()
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)

  const project = PROJECTS.find(p => p.id === Number(id))
  const handleBack = () => triggerPageOut(() => navigate('/work'))

  if (!project) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
          Project not found.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'transparent', overflowY: 'auto', overflowX: 'hidden' }}
    >

      {/* ── Back, on a line beneath the universal site logo ── */}
      <div style={{ padding: isMobile ? '90px 16px 0' : '120px 48px 0' }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <MdArrowBack size={12} color="#D4AF37" />
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4AF37' }}>Back to Work</span>
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px clamp(28px, 6vw, 96px) clamp(52px, 5.5vw, 88px)', maxWidth: 1380, margin: '0 auto' }}>

        {/* Title block */}
        <div style={{ marginBottom: 32, paddingTop: isMobile ? 20 : 10 }}>
          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(52px, 8.5vw, 124px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            lineHeight: 0.9,
            margin: '0 0 10px',
          }}>
            {project.title}
          </h1>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(36px, 6vw, 90px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            lineHeight: 0.9,
            margin: 0,
          }}>
            {project.brand.toUpperCase()}
          </h2>
        </div>

        {/* Metadata row — Category / Sub-category */}
        {/* Metadata row */}
        <div style={{
          display: 'flex',
          gap: isMobile ? 32 : 64,
          flexWrap: 'wrap',
          padding: '28px 0',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          marginBottom: 24,
        }}>
          <div>
            <p style={label('Category')}>Category</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
              {project.category}
            </p>
          </div>
          <div>
            <p style={label('Sub Category')}>Sub Category</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
              {project.subCategory}
            </p>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div style={{ marginBottom: 48, maxWidth: 720, borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: 28 }}>            <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: '0 0 16px',
          }}>
            Overview
          </p>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 300,
              lineHeight: 1.8,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '0.01em',
            }}>
              {project.description}
            </p>
          </div>
        )}

        {/* Hero image or video */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 72 }}>
          <div style={{ width: '95%', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
            {project.heroVideo ? (
              project.heroVideo.includes('youtube') || project.heroVideo.includes('youtu.be') ? (
                <iframe
                  src={project.heroVideo}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allowFullScreen
                  title={project.title}
                />
              ) : (
                <video
                  src={project.heroVideo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  controls
                  autoPlay
                  muted
                  loop
                />
              )
            ) : (
              <img
                src={project.heroImage}
                alt={project.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        </div>


        {/* ── Google Slides embed ── */}
        <div style={{ marginBottom: 80 }}>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: '0 0 20px',
          }}>
            Presentation
          </p>

          {project.slidesUrl ? (
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%', // 16:9
              background: '#0a0a0a',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <iframe
                src={project.slidesUrl}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  border: 'none',
                }}
                allowFullScreen
                title={`${project.title} – Presentation`}
              />
            </div>
          ) : (
            /* Placeholder shown until a real URL is added */
            <div style={{
              width: '100%', paddingBottom: '56.25%',
              position: 'relative',
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14,
              }}>
                {/* Google Slides icon */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="4" fill="rgba(255,255,255,0.05)" />
                  <path d="M14 12h14l10 10v14a2 2 0 01-2 2H14a2 2 0 01-2-2V14a2 2 0 012-2z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <path d="M28 12v10h10" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                  <rect x="17" y="24" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.25)" />
                  <rect x="17" y="28" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.15)" />
                  <rect x="17" y="32" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.15)" />
                </svg>
                <p style={{
                  fontFamily: 'Manrope, sans-serif', fontSize: 11,
                  fontWeight: 300, letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center',
                }}>
                  Presentation slides coming soon
                </p>
                <p style={{
                  fontFamily: 'Manrope, sans-serif', fontSize: 9,
                  fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.15)', margin: 0,
                }}>
                  Add your Google Slides URL in projects.ts
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 80 }} />
      </div>

      <Footer />
    </div>
  )
}

