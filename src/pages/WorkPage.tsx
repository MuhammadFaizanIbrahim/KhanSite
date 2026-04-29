import { useNavigate } from 'react-router-dom'

export default function WorkPage() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-start justify-end px-20 pb-16 fade-in">
      {/* back */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-8 left-12 font-subtitle text-[10px] tracking-[0.14em] uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2"/>
        </svg>
        Back
      </button>

      <div className="max-w-2xl">
        <p className="font-subtitle text-[10px] font-semibold tracking-[0.22em] uppercase text-white/30 mb-4">
          Selected Work
        </p>
        <h1 className="font-playfair text-white mb-4" style={{ fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1.1 }}>
          Work
        </h1>
        <p className="font-inter text-white/45 text-[15px] leading-relaxed max-w-md">
          A curated selection of innovation projects, concept systems, and foundational research.
        </p>
      </div>
    </div>
  )
}
