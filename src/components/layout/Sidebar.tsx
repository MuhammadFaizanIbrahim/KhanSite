import { useEffect, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import { smoothScrollTo } from '@/hooks/useLenis'

interface SidebarItem {
  label: string
  id: string
}

export default function Sidebar() {
  const { width } = useBreakpoint()
  const nav = useContent('navigation')

  // IDs are anchors for sections that will be built next — items simply no-op
  // until a matching #id exists in the DOM, so this list needs no future changes.
  const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: nav.sidebar.intro,                    id: 'hero' },
    { label: nav.sidebar.whatIsKhanConcepts,       id: 'what-is-khanconcepts' },
    { label: nav.sidebar.conceptDesignIndustries,  id: 'concept-innovation-space' },
    { label: nav.sidebar.conceptToSolutionProcess, id: 'how-we-bring-concepts-to-reality' },
    { label: nav.sidebar.featuredConcepts,         id: 'featured-concepts' },
  ]

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

  // Side nav is desktop-only — too cramped alongside the bottom pill nav below 1200px
  if (width < 1200) return null

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

              {/* Tick (collapsed) → Label (expanded on hover / active) — both
                  stay mounted and cross-fade via opacity instead of swapping,
                  so the label eases in/out alongside the width change rather
                  than popping in the instant there's room for it. */}
              <div style={{ marginLeft: 16, position: 'relative', height: 20 }}>
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 1, background: 'rgba(255,255,255,0.25)',
                  opacity: expanded ? 0 : 1,
                  transition: expanded ? 'opacity 0.15s ease' : 'opacity 0.25s ease 0.1s',
                  pointerEvents: 'none',
                }} />
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  color: isActive ? 'var(--text-gold)' : 'rgba(255,255,255,0.85)',
                  // Solid backing so the label reads as a floating UI element
                  // rather than bleeding transparently over whatever section content
                  // happens to sit underneath the (viewport-fixed) sidebar.
                  background: 'rgba(6,6,8,0.88)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  opacity: expanded ? 1 : 0,
                  pointerEvents: expanded ? 'auto' : 'none',
                  transition: expanded
                    ? 'opacity 0.3s ease 0.08s, color 0.3s ease'
                    : 'opacity 0.15s ease, color 0.3s ease',
                }}>{item.label}</span>
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
