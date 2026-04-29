interface NavbarProps {
  autoOn: boolean
  onToggleAuto: () => void
  onPageTransition: (path: string) => void
}

export default function Navbar({ autoOn, onToggleAuto }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-12 py-7 fade-in">

      {/* Left spacer */}
      <div className="w-28" />

      {/* Logo — centered, Bastliga One via inline style as guaranteed fallback */}
      <div className="flex-1 flex justify-center">
        <span
          style={{
            fontFamily: "'BastligaOne', serif",
            fontSize: 'clamp(42px, 3vw, 42px)',
            letterSpacing: '0.06em',
            color: '#ffffff',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          Khan
        </span>
      </div>

      {/* Auto/Manual toggle — right */}
      <div className="w-28 flex justify-end">
        <button
          onClick={onToggleAuto}
          className="flex items-center gap-2 border border-white/12 rounded-full px-3.5 py-1.5 transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        >
          {/* mini switch */}
          <span
            className="relative inline-block rounded-full transition-colors duration-200"
            style={{
              width: 28,
              height: 16,
              background: autoOn ? '#22c98a' : 'rgba(255,255,255,0.18)',
            }}
          >
            <span
              className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-200"
              style={{
                width: 12,
                height: 12,
                left: autoOn ? 14 : 2,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {autoOn ? 'Auto' : 'Manual'}
          </span>
        </button>
      </div>

    </nav>
  )
}