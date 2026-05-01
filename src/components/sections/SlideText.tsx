import { SECTIONS } from '@/data/sections'

interface SlideTextProps {
  section: typeof SECTIONS[0]
  onViewProjects?: () => void
}

export default function SlideText({ section, onViewProjects }: SlideTextProps) {
  if (!section.sidebarParent) return <div />

  return (
    <div className="flex items-end">
      <button
        className="group relative overflow-hidden"
        onClick={onViewProjects}
        style={{
          background: 'transparent',
          border: '0.5px solid rgba(255,255,255,0.22)',
          borderRadius: 6,
          padding: '11px 28px',
          cursor: 'pointer',
          transition: 'border-color 0.35s ease, background 0.35s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'
          e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
          e.currentTarget.style.background  = 'transparent'
        }}
      >
        {/* Shimmer on hover */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)',
          }}
        />
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
          position: 'relative',
        }}>
          View Projects
        </span>
      </button>
    </div>
  )
}
