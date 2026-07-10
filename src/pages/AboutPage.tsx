import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLenis } from '@/hooks/useLenis'
import Footer from '@/components/sections/Footer'

export default function AboutPage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)

  return (
    <div ref={scrollRef} className="fixed inset-0 bg-black overflow-y-auto overflow-x-hidden fade-in">
      {/* ── Back, on a line beneath the universal site logo ── */}
      <div className="pt-[90px] sm:pt-[120px] px-4 sm:px-12">
        <button
          onClick={() => navigate('/')}
          className="font-subtitle text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center gap-2"
          style={{ color: '#D4AF37' }}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round">
            <path d="M9 6H3M5 4L3 6l2 2"/>
          </svg>
          Back to Home
        </button>
      </div>

      <div className="min-h-screen flex flex-col items-start justify-end px-5 pb-10 sm:px-20 sm:pb-16">
        <div className="max-w-2xl">
          <p className="font-subtitle text-[10px] font-semibold tracking-[0.22em] uppercase text-white mb-4">
            About
          </p>
          <h1 className="font-playfair text-white mb-6" style={{ fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1.1 }}>
            Khan
            <span className="block font-logo text-white" style={{ fontSize: '0.55em', letterSpacing: '0.12em' }}>
              TheUnseen
            </span>
          </h1>
          <p className="font-inter text-white text-[15px] leading-relaxed max-w-lg">
            I innovate concepts that redefine industries — from product and business
            architecture to civilizational systems and deep technology.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
