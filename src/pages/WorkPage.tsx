import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useLenis } from '@/hooks/useLenis'
import { PROJECTS, CATEGORIES, SUB_CATS, type Project } from '@/data/projects'
import Footer from '@/components/sections/Footer'
import { MdArrowBack } from 'react-icons/md'

const ACCENT = '#22c98a'

// Returns [minCols, maxCols, defaultCols] for a given viewport width
function getColsRange(w: number): [number, number, number] {
  if (w < 480) return [1, 2, 2]
  if (w < 768) return [2, 3, 2]
  if (w < 1024) return [2, 4, 3]
  if (w < 1280) return [2, 5, 3]
  return [2, 6, 3]
}

// ─── Pill button ─────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '5px 14px',
        borderRadius: 40,
        border: `0.5px solid ${active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '0.6' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '1' }}
    >
      {label}
    </button>
  )
}

// ─── Grid View ────────────────────────────────────────────────────────────────
function GridView({ projects, cols, onProjectClick }: { projects: Project[]; cols: number; onProjectClick: (id: number) => void }) {
  const gap = cols >= 6 ? 10 : cols >= 5 ? 13 : cols >= 4 ? 16 : 20
  const titleSize = cols >= 5 ? 11 : cols >= 4 ? 13 : 'clamp(13px, 1.2vw, 16px)'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
    }}>
      {projects.map(p => (
        <div key={p.id} data-cursor="select" style={{ cursor: 'pointer' }} onClick={() => onProjectClick(p.id)}>
          <div style={{
            position: 'relative',
            paddingBottom: '62.5%',
            overflow: 'hidden',
            borderRadius: cols >= 5 ? 4 : 6,
            marginBottom: cols >= 5 ? 8 : 14,
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
                  width: cols >= 5 ? 32 : 44, height: cols >= 5 ? 32 : 44,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
              >
                <svg width={cols >= 5 ? 9 : 12} height={cols >= 5 ? 10 : 14} viewBox="0 0 12 14" fill="white">
                  <path d="M0 0l12 7-12 7V0z" />
                </svg>
              </div>
            </div>
          </div>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: cols >= 5 ? 8 : 10,
            fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: '0 0 4px',
          }}>{p.brand}</p>
          <h3 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: titleSize,
            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: 0,
          }}>{p.title}</h3>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkPage() {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)
  const [activeCat, setActiveCat] = useState('All')
  const [activeSubCat, setActiveSubCat] = useState('All')

  const [winWidth, setWinWidth] = useState(() => window.innerWidth)
  const [cols, setCols] = useState(() => getColsRange(window.innerWidth)[2])

  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = winWidth < 640
  const [minCols, maxCols] = getColsRange(winWidth)

  // Clamp cols when screen resizes past the max
  useEffect(() => {
    setCols(c => Math.min(Math.max(c, minCols), maxCols))
  }, [minCols, maxCols])

  const colOptions = Array.from({ length: maxCols - minCols + 1 }, (_, i) => minCols + i)

  const subCats = SUB_CATS[activeCat] ?? SUB_CATS.All

  const filtered = PROJECTS.filter(p => {
    if (activeCat !== 'All' && p.category !== activeCat) return false
    if (activeSubCat !== 'All' && p.subCategory !== activeSubCat) return false
    return true
  })

  const handleCatChange = (cat: string) => {
    setActiveCat(cat)
    setActiveSubCat('All')
  }

  const handleBack = () => triggerPageOut(() => navigate('/'))
  const handleProjectClick = (id: number) => triggerPageOut(() => navigate(`/work/${id}`))

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
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-gold)' }}>Back</span>
        </button>
      </div>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: isMobile ? '0 16px 64px' : '0 48px 100px' }}>

        {/* ── Header ── */}
        <div style={{
          paddingTop: isMobile ? 20 : 24, paddingBottom: isMobile ? 32 : 52,
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          {/* <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--text-primary)', marginBottom: 18,
          }}>Selected Work</p> */}
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(52px, 7vw, 88px)',
            fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1,
            margin: '0 0 20px',
          }}>Concepts</h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(13px, 1.3vw, 16px)',
            fontWeight: 300, fontStyle: 'italic',
            color: 'var(--text-primary)', letterSpacing: '0.02em',
          }}>
            Every great innovation starts with a concept.
          </p>
        </div>

        {/* ── Filters + Cols Selector ── */}
        <div style={{
          paddingTop: 28, paddingBottom: 28,
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap', gap: 20,
          alignItems: 'center', justifyContent: 'space-between',
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Category row */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 6 : 14 }}>
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--text-primary)', minWidth: 148,
              }}>Filter by Categories</span>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <Pill
                    key={cat}
                    label={cat === 'All' ? `All (${PROJECTS.length})` : cat}
                    active={activeCat === cat}
                    onClick={() => handleCatChange(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Sub-category row */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 6 : 14 }}>
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--text-primary)', minWidth: 148,
              }}>Sub-Categories</span>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {subCats.map(sub => (
                  <Pill
                    key={sub}
                    label={sub}
                    active={activeSubCat === sub}
                    onClick={() => setActiveSubCat(sub)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Columns selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>Columns</span>
            <div style={{
              display: 'flex',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 40, overflow: 'hidden',
            }}>
              {colOptions.map((n, i) => (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  style={{
                    fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.08em',
                    width: 36, height: 32,
                    background: cols === n ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: cols === n ? ACCENT : 'var(--text-primary)',
                    border: 'none',
                    borderRight: i < colOptions.length - 1 ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { if (cols !== n) e.currentTarget.style.opacity = '0.6' }}
                  onMouseLeave={e => { if (cols !== n) e.currentTarget.style.opacity = '1' }}
                >{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <div style={{ paddingTop: 18, paddingBottom: 20 }}>
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 9,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            {filtered.length} Concept{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
              No Concepts in this category yet.
            </p>
          </div>
        ) : (
          <GridView projects={filtered} cols={cols} onProjectClick={handleProjectClick} />
        )}
      </div>

      <Footer />
    </div>
  )
}
