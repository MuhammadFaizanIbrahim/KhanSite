import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { smoothScrollTo } from '@/hooks/useLenis'

export default function Navbar() {
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()
  const location  = useLocation()
  const { triggerPageOut } = usePageTransition()

  const handleLogoClick = () => {
    // Homepage scrolling is driven by Lenis on its own scroll container, not
    // the window — smoothScrollTo() targets whichever is actually active.
    if (location.pathname === '/') smoothScrollTo(0)
    else triggerPageOut(() => navigate('/'))
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center fade-in pointer-events-none"
      style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}
    >
      <img
        src="/images/logos/logo.svg"
        alt="KhanConcepts"
        onClick={handleLogoClick}
        style={{
          width: isMobile ? 'clamp(96px, 27vw, 136px)' : 'clamp(130px, 11.5vw, 192px)',
          height: 'auto',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      />
    </nav>
  )
}
