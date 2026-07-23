import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useContent } from '@/hooks/useContent'
import SEO from '@/components/SEO'
import StarDivider from '@/components/ui/StarDivider'
import Footer from '@/components/sections/Footer'
import { MdArrowForward } from 'react-icons/md'

const GOLD = '#D4AF37'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile } = useBreakpoint()
  const content = useContent('not-found-page')
  const seo = useContent('seo')

  return (
    <div className="fade-in" style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden', background: 'transparent' }}>
      <SEO
        title={`${seo.siteName} - ${content.title}`}
        description={content.message}
        path="/404"
        noIndex
      />

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: isMobile ? '110px 20px 60px' : '160px 40px 80px',
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontWeight: 600,
          fontSize: isMobile ? 44 : 68, letterSpacing: '0.12em', color: 'var(--text-gold)',
        }}>404</span>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: isMobile ? 'clamp(22px, 7vw, 28px)' : 'clamp(28px, 3vw, 40px)',
          margin: '10px 0 0', color: 'var(--text-primary)',
        }}>{content.heading}</h1>

        <StarDivider lineWidth={isMobile ? 50 : 80} style={{ margin: isMobile ? '18px 0' : '24px 0' }} />

        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14.5,
          lineHeight: 1.65, color: 'var(--text-primary)', maxWidth: 440, margin: 0,
        }}>{content.message}</p>

        <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => triggerPageOut(() => navigate('/'))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(90deg, #B8860B, #D4AF37 45%, #F0CB63 75%, #D4AF37)',
              fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1a1206',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {content.homeLabel}
            <MdArrowForward size={13} color="#1a1206" />
          </button>

          <button
            onClick={() => triggerPageOut(() => navigate('/concepts'))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 22px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(212,175,55,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-gold)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {content.conceptsLabel}
            <MdArrowForward size={13} color={GOLD} />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
