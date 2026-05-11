import { useBreakpoint } from '@/hooks/useBreakpoint'

interface NavbarProps {
  autoOn: boolean
  onToggleAuto: () => void
  onPageTransition: (path: string) => void
}

const FONT_SIZE   = 'clamp(44px, 6vw, 76px)'
const FONT_FAMILY = "'BastligaOne', serif"

function Logo() {
  return (
    <span className="logo-glow" style={{
      fontFamily:    FONT_FAMILY,
      fontSize:      FONT_SIZE,
      letterSpacing: '0.06em',
      lineHeight:    1,
      userSelect:    'none',
      display:       'block',
    }}>Khan</span>
  )
}

export default function Navbar({ autoOn, onToggleAuto }: NavbarProps) {
  const { isMobile } = useBreakpoint()

  const toggleButton = (
    <button
      onClick={onToggleAuto}
      className="flex items-center gap-2 border border-white/12 rounded-full px-3.5 py-1.5 transition-colors duration-200"
      style={{ background: 'rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
    >
      <span className="relative inline-block rounded-full transition-colors duration-200"
        style={{ width:28, height:16, background: autoOn ? '#22c98a' : 'rgba(255,255,255,0.18)' }}>
        <span className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-200"
          style={{ width:12, height:12, left: autoOn ? 14 : 2 }}/>
      </span>
      <span style={{
        fontFamily:'Manrope,sans-serif', fontSize:10, fontWeight:500,
        letterSpacing:'0.08em', textTransform:'uppercase',
        color:'#fff',
      }}>{autoOn ? 'Auto' : 'Manual'}</span>
    </button>
  )

  if (isMobile) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-30 pointer-events-none fade-in" style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <Logo />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, pointerEvents: 'auto' }}>
          {toggleButton}
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-start justify-between px-12 py-7 fade-in">
      <div className="w-28" />
      <div className="flex-1 flex justify-center">
        <Logo />
      </div>
      <div className="w-28 flex justify-end" style={{ marginTop: 72 }}>
        {toggleButton}
      </div>
    </nav>
  )
}
