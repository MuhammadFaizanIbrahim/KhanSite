import { useEffect, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { smoothScrollTo } from '@/hooks/useLenis'

interface SidebarItem {
  label: string
  id: string
}

// IDs are anchors for sections that will be built next — items simply no-op
// until a matching #id exists in the DOM, so this list needs no future changes.
const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Intro',                             id: 'hero' },
  { label: 'What Is KhanConcepts?',            id: 'what-is-khanconcepts' },
  { label: 'Concept Design Industries',         id: 'concept-innovation-space' },
  { label: 'Concept to Solution Process', id: 'how-we-bring-concepts-to-reality' },
  { label: 'Featured Concepts',                id: 'featured-concepts' },
]

export default function Sidebar() {
  const { isTablet } = useBreakpoint()
  const [active, setActive]   = useState(SIDEBAR_ITEMS[0].id)
  const [hovered, setHovered] = useState<string | null>(null)

  // Scrollspy — whichever section sits in the middle band of the viewport is "active".
  // Sections that don't exist yet are simply skipped; this needs no updates later.
  useEffect(() => {
    const els = SIDEBAR_ITEMS
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return

    const io = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) smoothScrollTo(el)
  }

  // Side nav is desktop-only — too cramped alongside the bottom pill nav on mobile/tablet
  if (isTablet) return null

  const dotSize = 13

  return (
    <div
      className="fixed z-30 flex flex-col items-start fade-in"
      style={{ left: 46, top: '50%', transform: 'translateY(-50%)' }}
    >
      {SIDEBAR_ITEMS.map((item, i) => {
        const isLast     = i === SIDEBAR_ITEMS.length - 1
        const isActive   = item.id === active
        const isHovered  = item.id === hovered
        const expanded   = isActive || isHovered

        return (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(item.id)}
            >
              {/* Dot */}
              <div style={{ position: 'relative', width: dotSize, height: dotSize, flexShrink: 0 }}>
                {isActive && (
                  <>
                    <div style={{
                      position: 'absolute', inset: -6, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.16)',
                      animation: 'sidebarGlow 2.4s ease-in-out infinite',
                    }} />
                    <div style={{
                      position: 'absolute', inset: -2, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.28)',
                    }} />
                  </>
                )}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: isActive ? '#D4AF37' : 'transparent',
                  border: isActive ? 'none' : `1px solid ${isHovered ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.28)'}`,
                  boxShadow: isActive ? '0 0 8px 2px rgba(212,175,55,0.55), 0 0 20px 4px rgba(212,175,55,0.18)' : 'none',
                  transition: 'all 0.35s ease',
                }} />
              </div>

              {/* Tick (collapsed) → Label (expanded on hover / active) */}
              <div style={{
                marginLeft: 16,
                overflow: 'hidden',
                maxWidth: expanded ? 340 : 18,
                transition: 'max-width 0.35s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', alignItems: 'center',
              }}>
                {expanded ? (
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.85)',
                    transition: 'color 0.3s ease',
                    // Solid backing so the label reads as a floating UI element
                    // rather than bleeding transparently over whatever section content
                    // happens to sit underneath the (viewport-fixed) sidebar.
                    background: 'rgba(6,6,8,0.88)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 6,
                    padding: '4px 10px',
                  }}>{item.label}</span>
                ) : (
                  <span style={{ width: 18, height: 1, background: 'rgba(255,255,255,0.25)', display: 'block' }} />
                )}
              </div>
            </div>

            {!isLast && (
              <div style={{ marginLeft: (dotSize - 1) / 2 }}>
                <div style={{
                  width: 1,
                  height: 48,
                  marginTop: 4, marginBottom: 4,
                  background: isActive
                    ? 'linear-gradient(to bottom, rgba(212,175,55,0.55), rgba(212,175,55,0.05))'
                    : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.4s ease',
                }} />
              </div>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes sidebarGlow {
          0%,100%{ opacity:.6; transform:scale(1); }
          50%    { opacity:1;  transform:scale(1.2); }
        }
      `}</style>
    </div>
  )
}
