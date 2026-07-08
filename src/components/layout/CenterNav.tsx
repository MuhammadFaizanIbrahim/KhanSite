import { useState } from 'react'
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
  icon:      (color: string) => JSX.Element
}

const ICON_STROKE = 1.6

const items: NavItem[] = [
  {
    label: 'Home', action: 'home',
    icon: c => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    label: 'Concepts', action: 'route', path: '/concepts',
    icon: c => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Contact', action: 'route', path: '/contact',
    icon: c => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" />
      </svg>
    ),
  },
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
                  display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center', justifyContent: 'center', gap: isMobile ? 5 : 8,
                  padding: isMobile ? '4px 6px' : '4px 10px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                {isMobile && item.icon(active ? '#D4AF37' : 'rgba(255,255,255,0.75)')}
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
          onClick={() => setSoundOn(p => !p)}
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
    </nav>
  )
}
