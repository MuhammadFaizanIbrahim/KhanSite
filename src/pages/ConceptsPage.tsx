import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { PROJECTS } from '@/data/projects'

// Pick the first concept from each of the 4 categories
const FEATURED_IDS = [1, 3, 5, 7]
const FEATURED = PROJECTS.filter(p => FEATURED_IDS.includes(p.id))

interface ConceptsPageProps {
  isSection?: boolean
  onClose?: () => void
}

export default function ConceptsPage({ isSection, onClose }: ConceptsPageProps) {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()

  const handleBack = () => {
    if (isSection && onClose) {
      onClose()
    } else {
      triggerPageOut(() => navigate('/'))
    }
  }
  const handleViewAll = () => triggerPageOut(() => navigate('/work'))

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed', inset: 0, background: '#000',
        overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      {/* ── Back button ── */}
      <button
        onClick={handleBack}
        style={{
          position: 'fixed', top: 20, left: 48, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#fff', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2" />
        </svg>
        Back
      </button>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 48px 100px' }}>

        {/* ── Header ── */}
        <div style={{
          paddingTop: 200, paddingBottom: 52,
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          {/* <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#fff', marginBottom: 18,
          }}>Selected Work</p> */}
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(52px, 3.5vw, 88px)',
            fontWeight: 700, color: '#fff', lineHeight: 1,
            margin: '0 0 20px',
          }}>Featured Concepts</h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(13px, 1.3vw, 16px)',
            fontWeight: 300, fontStyle: 'italic',
            color: '#fff', letterSpacing: '0.02em',
          }}>
            Every great innovation starts with a concept.
          </p>
        </div>

        {/* ── 4-column grid ── */}
        <div style={{ paddingTop: 48, paddingBottom: 60 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {FEATURED.map(p => (
              <div
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => triggerPageOut(() => navigate(`/work/${p.id}`))}
              >
                {/* Image */}
                <div style={{
                  position: 'relative',
                  paddingBottom: '100%',
                  overflow: 'hidden',
                  borderRadius: 6,
                  marginBottom: 14,
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  />

                  {/* Hover play overlay */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0)',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)' }}
                  >
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.3s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
                    >
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                        <path d="M0 0l12 7-12 7V0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Title text */}
                <p style={{
                  fontFamily: 'Manrope, sans-serif', fontSize: 10,
                  fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#fff', margin: '0 0 4px',
                }}>{p.brand}</p>
                <h3 style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 'clamp(13px, 1.2vw, 16px)',
                  fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: '#fff', margin: 0,
                }}>{p.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ── View All Projects button ── */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 20 }}>
          <button
            className="group relative overflow-hidden"
            onClick={handleViewAll}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 50,
              padding: '10px 32px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.boxShadow = '0 0 18px rgba(255,255,255,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
                borderRadius: 'inherit',
              }}
            />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10, fontWeight: 400,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#fff',
              position: 'relative',
            }}>
              View All Concepts
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
