import { useParams, useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { PROJECTS } from '@/data/projects'
import { useBreakpoint } from '@/hooks/useBreakpoint'

const label = (text: string) => ({
  fontFamily: 'Manrope, sans-serif' as const,
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#fff',
  margin: '0 0 10px',
})

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile } = useBreakpoint()

  const project = PROJECTS.find(p => p.id === Number(id))
  const handleBack = () => triggerPageOut(() => navigate('/work'))

  if (!project) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#040609', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: '#fff', letterSpacing: '0.08em' }}>
          Project not found.
        </p>
      </div>
    )
  }

  return (
    <div
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: '#040609', overflowY: 'auto', overflowX: 'hidden' }}
    >

      {/* ── Hero image — centered, ~68% wide, 16:9 ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: isMobile ? '56px 0 0' : '80px 0 0', background: '#040609' }}>
        <div style={{ width: isMobile ? '94%' : '68%', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={project.heroImage}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      {/* ── Back button (fixed, always visible) ── */}
      <button
        onClick={handleBack}
        style={{
          position: 'fixed', top: 20, left: isMobile ? 16 : 48, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#fff', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.6' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2" />
        </svg>
        Projects
      </button>

      {/* ── Content ── */}
      <div style={{ padding: 'clamp(52px, 5.5vw, 88px) clamp(28px, 6vw, 96px)', maxWidth: 1380, margin: '0 auto' }}>

        {/* Title block */}
        <div style={{ marginBottom: 52 }}>
          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(52px, 8.5vw, 124px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#ffffff',
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
            color: '#fff',
            lineHeight: 0.9,
            margin: 0,
          }}>
            {project.brand.toUpperCase()}
          </h2>
        </div>

        {/* Metadata row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '180px 1fr',
          gap: isMobile ? '24px 0' : '0 80px',
          padding: '36px 0',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
          marginBottom: 84,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p style={label('Category')}>Category</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 400, color: '#fff', margin: 0 }}>
                {project.category}
              </p>
            </div>
            <div>
              <p style={label('Sub Category')}>Sub Category</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 400, color: '#fff', margin: 0 }}>
                {project.subCategory}
              </p>
            </div>
          </div>
          <div>
            <p style={label(project.brand)}>{project.brand.toUpperCase()}</p>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 580,
            }}>
              {project.description}
            </p>
          </div>
        </div>

        {/* Q&A detail blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 68 }}>
          {project.details.map((detail, i) => (
            <div key={i}>
              <h3 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(26px, 2.8vw, 40px)',
                fontWeight: 400,
                color: '#ffffff',
                margin: '0 0 18px',
                lineHeight: 1.15,
              }}>
                {detail.question}
              </h3>
              <p style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(13px, 1.15vw, 16px)',
                fontWeight: 300,
                color: '#fff',
                lineHeight: 1.85,
                margin: 0,
                maxWidth: 660,
              }}>
                {detail.answer}
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 120 }} />
      </div>
    </div>
  )
}
