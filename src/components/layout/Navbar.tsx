import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'

export default function Navbar() {
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()
  const location  = useLocation()
  const { triggerPageOut } = usePageTransition()

  const handleLogoClick = () => {
    if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
    else triggerPageOut(() => navigate('/'))
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center fade-in pointer-events-none"
      style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}
    >
      <img
        src="/images/logo/logo.png"
        alt="KhanConcepts"
        onClick={handleLogoClick}
        style={{
          width: isMobile ? 'clamp(84px, 24vw, 120px)' : 'clamp(110px, 10vw, 168px)',
          height: 'auto',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      />
    </nav>
  )
}
