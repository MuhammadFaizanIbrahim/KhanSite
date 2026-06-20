import { SECTIONS } from '@/data/sections'
import { useBreakpoint } from '@/hooks/useBreakpoint'

interface SidebarProps {
  currentIdx: number
  autoOn: boolean
  onNav: (dir: number) => void
  onDotClick: (idx: number) => void
  onPageTransition: (path: string) => void
  onDisableAuto: () => void
  isConceptsActive?: boolean
  isContactActive?: boolean
}

interface SidebarItem {
  label: string
  idx: number
  path?: string
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Intro', idx: 0 },
  { label: 'Concepts', idx: -1, path: '#featuredconcepts' },
  { label: 'Process', idx: 1 },
  { label: 'Contact', idx: -1, path: '#contact' },
]

export default function Sidebar({ currentIdx, autoOn, onDotClick, onPageTransition, onDisableAuto, isConceptsActive, isContactActive }: SidebarProps) {
  const { isMobile } = useBreakpoint()

  const renderDot = (isActive: boolean, isPassed: boolean) => {
    const size = isMobile ? 7 : 9
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {isActive && (
          <>
            <div style={{
              position: 'absolute', inset: -5, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              animation: 'sidebarGlow 2.4s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -2, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)',
            }} />
          </>
        )}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: isActive ? '#fff' : isPassed ? 'rgba(255,255,255,0.38)' : 'transparent',
          border: isActive ? 'none' : `1px solid ${isPassed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)'}`,
          boxShadow: isActive ? '0 0 8px 2px rgba(255,255,255,0.45), 0 0 20px 4px rgba(255,255,255,0.1)' : 'none',
          transition: 'all 0.4s ease',
        }} />
      </div>
    )
  }

  const renderLine = (isPassed: boolean, height = 36) => (
    <div style={{
      width: 1,
      height: isMobile ? Math.round(height * 0.6) : height,
      marginTop: 3, marginBottom: 3,
      background: isPassed
        ? 'linear-gradient(to bottom, rgba(100,130,255,0.6), rgba(70,100,210,0.3))'
        : 'rgba(255,255,255,0.07)',
      transition: 'background 0.5s ease',
    }} />
  )

  return (
    <div
      className="fixed z-30 flex flex-col items-start fade-in"
      style={{ left: isMobile ? 12 : 36, top: '50%', transform: 'translateY(-50%)' }}
    >
      {SIDEBAR_ITEMS.map((item, i) => {
        const isLast = i === SIDEBAR_ITEMS.length - 1
        
        let activeSeqIdx = 0
        if (isContactActive) {
          activeSeqIdx = 3
        } else if (currentIdx === 1 && !isConceptsActive) {
          activeSeqIdx = 2
        } else if (isConceptsActive) {
          activeSeqIdx = 1
        } else {
          activeSeqIdx = 0
        }

        const isActive = i === activeSeqIdx
        const isPassed = i < activeSeqIdx

        return (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, cursor: 'pointer' }}
              onClick={() => {
                if (item.path) {
                  onPageTransition(item.path)
                } else {
                  if (autoOn) onDisableAuto()
                  onDotClick(item.idx)
                }
              }}
            >
              {renderDot(isActive, isPassed)}

              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 11 : 14,
                fontWeight: isActive ? 500 : 300,
                letterSpacing: '0.05em',
                color: isActive
                  ? 'rgba(255,255,255,0.92)'
                  : isPassed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.4s ease',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            </div>
            {!isLast && (
              <div style={{ marginLeft: isMobile ? 3 : 4 }}>
                {renderLine(isPassed, 52)}
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
