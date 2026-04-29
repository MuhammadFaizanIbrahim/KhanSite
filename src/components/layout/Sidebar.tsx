import { SECTIONS } from '@/data/sections'

interface SidebarProps {
  currentIdx: number
  autoOn: boolean
  onNav: (dir: number) => void
  onDotClick: (idx: number) => void
  onContactOpen: () => void
}

interface SidebarItem {
  type: 'section' | 'parent' | 'sub'
  idx: number
  label: string
  children?: SidebarItem[]
}

function buildTree(): SidebarItem[] {
  const tree: SidebarItem[] = []
  let servicesParent: SidebarItem | null = null

  SECTIONS.forEach((sec, i) => {
    if (sec.sidebarParent) {
      if (!servicesParent) {
        servicesParent = { type: 'parent', idx: -1, label: sec.sidebarParent, children: [] }
        tree.push(servicesParent)
      }
      servicesParent.children!.push({ type: 'sub', idx: i, label: sec.label })
    } else {
      tree.push({ type: 'section', idx: i, label: sec.label })
    }
  })
  return tree
}

const TREE = buildTree()

export default function Sidebar({ currentIdx, autoOn, onDotClick, onContactOpen }: SidebarProps) {
  const activeSection  = SECTIONS[currentIdx]
  const isInServices   = !!activeSection?.sidebarParent

  const renderDot = (isActive: boolean, isPassed: boolean, isSub = false) => {
    const size = isSub ? 7 : 9
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
      width: 1, height,
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
      style={{ left: 36, top: '50%', transform: 'translateY(-50%)' }}
    >
      {TREE.map((item, treeIdx) => {
        const isLast = treeIdx === TREE.length - 1

        /* ── TOP-LEVEL SECTION ── */
        if (item.type === 'section') {
          const sec      = SECTIONS[item.idx] as any
          const isOverlay = sec?.isOverlay
          const isActive = currentIdx === item.idx
          const isPassed = currentIdx > item.idx

          return (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                onClick={() => {
                  if (isOverlay) { onContactOpen(); return }
                  if (!autoOn) onDotClick(item.idx)
                }}
              >
                {/* Overlay sections get a small dash instead of a dot */}
                {isOverlay ? (
                  <div style={{
                    width: 9, height: 1, flexShrink: 0,
                    background: 'rgba(255,255,255,0.3)',
                  }} />
                ) : renderDot(isActive, isPassed)}
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: isOverlay ? 400 : isActive ? 500 : 300,
                  letterSpacing: '0.05em',
                  color: isOverlay
                    ? 'rgba(255,255,255,0.45)'
                    : isActive ? 'rgba(255,255,255,0.92)' : isPassed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.4s ease',
                  whiteSpace: 'nowrap',
                  fontStyle: isOverlay ? 'italic' : 'normal',
                }}>
                  {item.label}
                </span>
              </div>
              {!isLast && (
                <div style={{ marginLeft: 4 }}>
                  {renderLine(isOverlay ? false : isPassed, 32)}
                </div>
              )}
            </div>
          )
        }

        /* ── SERVICES PARENT + SUB-SECTIONS ── */
        if (item.type === 'parent') {
          const firstSubIdx = item.children![0].idx
          const lastSubIdx  = item.children![item.children!.length - 1].idx
          const isPassed    = currentIdx > lastSubIdx
          const isInGroup   = currentIdx >= firstSubIdx && currentIdx <= lastSubIdx

          return (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

              {/* Services parent label — indented same level, dash + uppercase */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{
                  width: 10, height: 1, flexShrink: 0,
                  background: isInGroup || isPassed ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)',
                  transition: 'background 0.4s ease',
                }} />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isInGroup ? 'rgba(255,255,255,0.65)' : isPassed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                  transition: 'color 0.4s ease',
                }}>
                  {item.label}
                </span>
              </div>

              {/* Sub-sections — indented further */}
              <div style={{ paddingLeft: 22, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {item.children!.map((sub, si) => {
                  const isActive  = currentIdx === sub.idx
                  const isPassed  = currentIdx > sub.idx
                  const isLastSub = si === item.children!.length - 1

                  return (
                    <div key={sub.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: autoOn ? 'default' : 'pointer' }}
                        onClick={() => { if (!autoOn) onDotClick(sub.idx) }}
                      >
                        {renderDot(isActive, isPassed, true)}
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          fontWeight: isActive ? 500 : 300,
                          letterSpacing: '0.04em',
                          color: isActive ? 'rgba(255,255,255,0.88)' : isPassed ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.16)',
                          transition: 'color 0.4s ease',
                          whiteSpace: 'nowrap',
                        }}>
                          {sub.label}
                        </span>
                      </div>
                      {/* Line after sub-item */}
                      {(!isLastSub || !isLast) && (
                        <div style={{ marginLeft: 3 }}>
                          {renderLine(isPassed, isLastSub ? 28 : 30)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
          )
        }

        return null
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