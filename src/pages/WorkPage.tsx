import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface Project {
  id: number
  title: string
  brand: string
  category: string
  subCategory: string
  image: string
  year: string
  duration: string
}

const PROJECTS: Project[] = [
  {
    id: 1, title: 'XBOOM', brand: 'LG',
    category: 'Commercial', subCategory: 'TVC',
    image: 'https://picsum.photos/seed/proj-lg-xboom/800/500',
    year: '2024', duration: '0:30',
  },
  {
    id: 2, title: 'SMALL BUSINESS', brand: 'Amazon',
    category: 'Commercial', subCategory: 'Digital',
    image: 'https://picsum.photos/seed/proj-amazon-sb/800/500',
    year: '2024', duration: '1:15',
  },
  {
    id: 3, title: 'STITCHED TOGETHER', brand: 'Coca-Cola',
    category: 'Brand Film', subCategory: 'Narrative',
    image: 'https://picsum.photos/seed/proj-coke-stitch/800/500',
    year: '2024', duration: '2:30',
  },
  {
    id: 4, title: 'HOLIDAYS ARE COMING 2025', brand: 'Coca-Cola',
    category: 'Commercial', subCategory: 'TVC',
    image: 'https://picsum.photos/seed/proj-coke-holiday/800/500',
    year: '2025', duration: '1:00',
  },
  {
    id: 5, title: 'THE WHOLE DARN ROCK', brand: 'Kalshi',
    category: 'Documentary', subCategory: 'Short Form',
    image: 'https://picsum.photos/seed/proj-kalshi-rock/800/500',
    year: '2024', duration: '8:45',
  },
  {
    id: 6, title: 'INVISIBLE ARCHITECTURE', brand: 'Apple',
    category: 'Brand Film', subCategory: 'Documentary',
    image: 'https://picsum.photos/seed/proj-apple-arch/800/500',
    year: '2024', duration: '3:20',
  },
  {
    id: 7, title: 'SYSTEMIC SHIFT', brand: 'Tesla',
    category: 'Documentary', subCategory: 'Long Form',
    image: 'https://picsum.photos/seed/proj-tesla-sys/800/500',
    year: '2023', duration: '24:00',
  },
  {
    id: 8, title: 'BEYOND THE GRID', brand: 'Nike',
    category: 'Digital', subCategory: 'Interactive',
    image: 'https://picsum.photos/seed/proj-nike-grid/800/500',
    year: '2024', duration: '0:45',
  },
]

const CATEGORIES = ['All', 'Commercial', 'Brand Film', 'Documentary', 'Digital']

const SUB_CATS: Record<string, string[]> = {
  All:          ['All', 'TVC', 'Digital', 'Narrative', 'Documentary', 'Short Form', 'Long Form', 'Interactive'],
  Commercial:   ['All', 'TVC', 'Digital'],
  'Brand Film': ['All', 'Narrative', 'Documentary'],
  Documentary:  ['All', 'Short Form', 'Long Form'],
  Digital:      ['All', 'Interactive', 'Social'],
}

type ViewMode = 'grid' | 'carousel' | 'list'

const ACCENT = '#22c98a'

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
        color: active ? '#fff' : 'rgba(255,255,255,0.35)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
    >
      {label}
    </button>
  )
}

// ─── Grid View ────────────────────────────────────────────────────────────────
function GridView({ projects }: { projects: Project[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 20,
    }}>
      {projects.map(p => (
        <div
          key={p.id}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            position: 'relative',
            paddingBottom: '62.5%',
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
            <span style={{
              position: 'absolute', top: 10, right: 10,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 9, letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(0,0,0,0.55)',
              padding: '3px 8px', borderRadius: 3,
              backdropFilter: 'blur(6px)',
            }}>{p.year}</span>
            <span style={{
              position: 'absolute', bottom: 10, left: 10,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              background: 'rgba(0,0,0,0.55)',
              padding: '3px 8px', borderRadius: 3,
              backdropFilter: 'blur(6px)',
            }}>{p.subCategory}</span>
            {/* Hover play overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0)',
              transition: 'background 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                  <path d="M0 0l12 7-12 7V0z"/>
                </svg>
              </div>
            </div>
          </div>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 10,
            fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', margin: '0 0 5px',
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
  )
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '18px 12px',
            borderBottom: '0.5px solid rgba(255,255,255,0.07)',
            cursor: 'pointer',
            borderRadius: 4,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {/* Thumbnail */}
          <div style={{
            width: 84, height: 54,
            borderRadius: 4, overflow: 'hidden', flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
          }}>
            <img
              src={p.image} alt={p.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Index */}
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10,
            color: 'rgba(255,255,255,0.18)', width: 24, flexShrink: 0,
          }}>
            {String(i + 1).padStart(2, '0')}
          </span>

          {/* Title */}
          <h3 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(12px, 1.1vw, 15px)',
            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#fff', margin: 0, flex: 1,
          }}>{p.title}</h3>

          {/* Category pill */}
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 8,
            fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            padding: '3px 10px', borderRadius: 20,
            flexShrink: 0, display: 'none',
          }}>{p.subCategory}</span>

          {/* Brand */}
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 10,
            fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', flexShrink: 0, width: 110, textAlign: 'right' as const,
          }}>{p.brand}</span>

          {/* Duration */}
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10,
            color: 'rgba(255,255,255,0.2)', flexShrink: 0, width: 36, textAlign: 'right' as const,
          }}>{p.duration}</span>

          {/* Play button */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '0.5px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
          >
            <svg width="7" height="9" viewBox="0 0 7 9" fill="rgba(255,255,255,0.5)">
              <path d="M0 0l7 4.5L0 9V0z"/>
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Carousel View ────────────────────────────────────────────────────────────
function CarouselView({ projects }: { projects: Project[] }) {
  const [idx, setIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const prev = () => setIdx(i => (i - 1 + projects.length) % projects.length)
  const next = () => setIdx(i => (i + 1) % projects.length)

  const current = projects[idx]

  return (
    <div>
      {/* Main featured card */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          paddingBottom: '52%',
          overflow: 'hidden',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
        }}>
          {projects.map((p, i) => (
            <img
              key={p.id}
              src={p.image}
              alt={p.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: i === idx ? 1 : 0,
                transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          ))}

          {/* Overlay gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}/>

          {/* Info overlay */}
          <div style={{
            position: 'absolute', bottom: 32, left: 40,
            pointerEvents: 'none',
          }}>
            <p style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 11,
              fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', margin: '0 0 8px',
            }}>{current.brand} — {current.year}</p>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(22px, 2.8vw, 38px)',
              fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: '#fff', margin: 0, lineHeight: 1.1,
            }}>{current.title}</h2>
          </div>

          {/* Nav arrows */}
          {[
            { dir: -1, pos: { left: 20 }, click: prev, icon: 'M10 6H2M5 4L2 6l3 2' },
            { dir: 1,  pos: { right: 20 }, click: next, icon: 'M2 6h8M7 4l3 2-3 2' },
          ].map(({ pos, click, icon }) => (
            <button
              key={icon}
              onClick={click}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                ...pos,
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                border: '0.5px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.45)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <path d={icon}/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div ref={trackRef} style={{
        display: 'flex', gap: 10, marginTop: 14,
        overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none' as const,
      }}>
        {projects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIdx(i)}
            style={{
              flexShrink: 0,
              width: 100, height: 64, borderRadius: 4,
              overflow: 'hidden', padding: 0,
              border: `1.5px solid ${i === idx ? ACCENT : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', transition: 'border-color 0.25s',
              background: 'rgba(255,255,255,0.03)',
              opacity: i === idx ? 1 : 0.55,
            }}
          >
            <img
              src={p.image} alt={p.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      {/* Dots indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 20 : 5, height: 5,
              borderRadius: 3, padding: 0, border: 'none',
              background: i === idx ? ACCENT : 'rgba(255,255,255,0.2)',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('grid')
  const [activeCat, setActiveCat] = useState('All')
  const [activeSubCat, setActiveSubCat] = useState('All')
  const [bgSound, setBgSound] = useState(false)

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

  return (
    <div
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: '#000', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* ── Back button ── */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 32, left: 48, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2"/>
        </svg>
        Back
      </button>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 48px 100px' }}>

        {/* ── Header ── */}
        <div style={{
          paddingTop: 110, paddingBottom: 52,
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>

          {/* Left: ambient sound toggle */}
          <div style={{ paddingTop: 12, minWidth: 100 }}>
            <button
              onClick={() => setBgSound(s => !s)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `0.5px solid ${bgSound ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.3s',
                background: bgSound ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M5 3.5L2 6H0v1h2l3 2.5V3.5z" fill={bgSound ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'}/>
                  {bgSound && <>
                    <path d="M8 5a2.5 2.5 0 010 3" stroke="rgba(255,255,255,0.5)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
                    <path d="M9.5 3.5a4.5 4.5 0 010 6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
                  </>}
                </svg>
              </div>
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 8,
                fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: bgSound ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                textAlign: 'center', lineHeight: 1.5, transition: 'color 0.3s',
              }}>
                Low<br/>Background<br/>Sound
              </span>
            </button>
          </div>

          {/* Center: heading */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 18,
            }}>Selected Work</p>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(52px, 7vw, 88px)',
              fontWeight: 700, color: '#fff', lineHeight: 1,
              margin: '0 0 20px',
            }}>Projects</h1>
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(13px, 1.3vw, 16px)',
              fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.32)', letterSpacing: '0.02em',
            }}>
              There's no value in anything until it's done!
            </p>
          </div>

          {/* Right spacer */}
          <div style={{ minWidth: 100 }} />
        </div>

        {/* ── Filters + View Toggle ── */}
        <div style={{
          paddingTop: 28, paddingBottom: 28,
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap', gap: 20,
          alignItems: 'center', justifyContent: 'space-between',
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Category row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', minWidth: 148,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', minWidth: 148,
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

          {/* View toggle */}
          <div style={{
            display: 'flex',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 40, overflow: 'hidden',
            flexShrink: 0,
          }}>
            {(['grid', 'carousel', 'list'] as ViewMode[]).map((v, i) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  padding: '8px 22px',
                  background: view === v ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: view === v ? ACCENT : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ paddingTop: 18, paddingBottom: 20 }}>
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 9,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
          }}>
            {filtered.length} Project{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Views ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
              No projects in this category yet.
            </p>
          </div>
        ) : (
          <>
            {view === 'grid'     && <GridView     projects={filtered} />}
            {view === 'list'     && <ListView     projects={filtered} />}
            {view === 'carousel' && <CarouselView projects={filtered} />}
          </>
        )}
      </div>
    </div>
  )
}
