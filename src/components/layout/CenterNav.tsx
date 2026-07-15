import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { smoothScrollTo } from '@/hooks/useLenis'

interface NavItem {
  label:     string
  mobileLabel?: string
  action:    'home' | 'route' | 'anchor'
  path?:     string
  anchor?:   string
}

const ICON_STROKE = 1.6

const items: NavItem[] = [
  { label: 'Home', action: 'home' },
  { label: 'Concepts', action: 'route', path: '/concepts' },
  { label: 'Contact', action: 'route', path: '/contact' },
]

function MusicIcon({ on }: { on: boolean }) {
  const c = on ? '#D4AF37' : 'rgba(255,255,255,0.6)'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export default function CenterNav() {
  const { isMobile } = useBreakpoint()
  const navigate      = useNavigate()
  const location       = useLocation()
  const { triggerPageOut } = usePageTransition()
  const [soundOn, setSoundOn] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggleSound = () => {
    const audio = audioRef.current
    if (audio) {
      if (soundOn) {
        audio.pause()
      } else {
        audio.volume = 0.4
        audio.play().catch(() => { /* blocked until a user gesture — harmless to ignore */ })
      }
    }
    setSoundOn(p => !p)
  }

  const isHome = location.pathname === '/'

  const handleClick = (item: NavItem) => {
    if (item.action === 'home') {
      if (isHome) smoothScrollTo(0)
      else triggerPageOut(() => navigate('/'))
      return
    }
    if (item.action === 'route' && item.path) {
      triggerPageOut(() => navigate(item.path!))
      return
    }
    if (item.action === 'anchor' && item.anchor) {
      const el = document.getElementById(item.anchor)
      if (el) smoothScrollTo(el)
    }
  }

  const isActive = (item: NavItem) =>
    (item.action === 'home' && isHome) ||
    (item.action === 'route' && location.pathname === item.path)

  return (
    <nav
      className="fixed left-1/2 z-30 fade-in"
      style={{
        bottom: isMobile ? 'max(32px, env(safe-area-inset-bottom) + 20px)' : 28,
        transform: 'translateX(-50%)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: isMobile ? 0 : 4,
        padding: isMobile ? '10px 12px' : '14px 12px',
        borderRadius: 999,
        border: '1px solid rgba(212,175,55,0.28)',
        background: 'rgba(10,10,13,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}>
        {items.map((item, i) => {
          const active = isActive(item)
          const label  = isMobile ? (item.mobileLabel ?? item.label) : item.label
          return (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              {i !== 0 && (
                <div style={{ width: 1, height: isMobile ? 24 : 20, background: 'rgba(255,255,255,0.12)', margin: isMobile ? '0 8px' : '0 14px' }} />
              )}
              <button
                onClick={() => handleClick(item)}
                style={{
                  display: 'flex', flexDirection: 'row',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: isMobile ? '4px 6px' : '4px 10px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: isMobile ? 12 : 'clamp(15px, 1.05vw, 18px)',
                  fontWeight: active ? 600 : 400,
                  lineHeight: 1,
                  color: active ? '#D4AF37' : 'rgba(255,255,255,0.82)',
                  whiteSpace: 'nowrap',
                  borderBottom: active && !isMobile ? '1px solid #D4AF37' : '1px solid transparent',
                  paddingBottom: active && !isMobile ? 3 : 0,
                  transition: 'color 0.25s ease',
                }}>{label}</span>
              </button>
            </div>
          )
        })}

        <div style={{ width: 1, height: isMobile ? 24 : 20, background: 'rgba(255,255,255,0.12)', margin: isMobile ? '0 8px' : '0 14px' }} />

        <button
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label="Toggle sound"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '4px 8px' : '4px 10px',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <MusicIcon on={soundOn} />
        </button>
      </div>

      <audio ref={audioRef} src="/audio/Background-Sound.mp3" loop preload="none" />
    </nav>
  )
}
