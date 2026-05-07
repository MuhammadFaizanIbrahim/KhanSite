import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { SECTIONS, SECTION_INTERVAL } from '@/data/sections'
import { useWebGL, MODE_SECTION, MODE_PAGE } from '@/hooks/useWebGL'
import Navbar         from '@/components/layout/Navbar'
import Sidebar        from '@/components/layout/Sidebar'
import HeroVideo, { HeroVideoHandle } from '@/components/sections/HeroVideo'

function nextSection(from: number, dir: 1 | -1): number {
  const total = SECTIONS.length
  let idx = (from + dir + total) % total
  let guard = 0
  while (SECTIONS[idx]?.isOverlay && guard < total) {
    idx = (idx + dir + total) % total
    guard++
  }
  return idx
}

export default function HomeSlideshow() {
  const navigate = useNavigate()
  const [cur, setCur]                 = useState(0)
  const [autoOn, setAutoOn]           = useState(true)
  const [transActive, setTransActive] = useState(false)

  const curRef  = useRef(0)
  const tStart  = useRef<number | null>(null)
  const rafT    = useRef(0)
  const toId    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heroRef = useRef<HeroVideoHandle>(null)

  useEffect(() => { curRef.current = cur }, [cur])

  const { isMobile } = useBreakpoint()

  const {
    canvasRef, triggerTransition, setSkipDraw,
    captureVideoTexture,
  } = useWebGL(curRef)

  const currentSection = SECTIONS[cur]
  const isVideoSection = !!currentSection?.isVideo
  const holdForVideo   = !!currentSection?.holdUntilVideoEnd
  const isVideoActive  = isVideoSection && !transActive

  const updateSkip = useCallback((idx: number, active: boolean) => {
    setSkipDraw(!!(SECTIONS[idx]?.isVideo) && !active)
  }, [setSkipDraw])

  const handlePageTransition = useCallback((path: string) => {
    if (path === '/') return
    const idx = nextSection(curRef.current, 1)
    triggerTransition(idx, MODE_PAGE)
    setTimeout(() => navigate(path), 900)
  }, [triggerTransition, navigate])

  const goTo = useCallback((idx: number, mode = MODE_SECTION) => {
    if (idx === curRef.current) return
    if (SECTIONS[idx]?.isOverlay) return

    setTransActive(true)
    updateSkip(idx, true)
    triggerTransition(idx, mode)
    setCur(idx)

    const dur = mode === MODE_PAGE ? 1200 : 1000
    setTimeout(() => {
      setTransActive(false)
      updateSkip(idx, false)
    }, dur)
  }, [triggerTransition, updateSkip])

  const manualNav = useCallback((dir: number) => {
    if (autoOn) return
    goTo(nextSection(curRef.current, dir as 1 | -1))
  }, [autoOn, goTo])

  useEffect(() => { updateSkip(0, false) }, [updateSkip])

  // Timer
  const stopTimer = useCallback(() => {
    if (toId.current) clearTimeout(toId.current)
    cancelAnimationFrame(rafT.current)
    tStart.current = null
  }, [])

  const restartTimer = useCallback((idx: number) => {
    stopTimer()
    if (!autoOn) return
    const sec = SECTIONS[idx]
    if (sec?.holdUntilVideoEnd) return
    function tick(ts: number) {
      if (!tStart.current) tStart.current = ts
      const el = ts - tStart.current
      if (el < SECTION_INTERVAL) rafT.current = requestAnimationFrame(tick)
    }
    rafT.current = requestAnimationFrame(tick)
    toId.current = setTimeout(() => {
      goTo(nextSection(curRef.current, 1), MODE_SECTION)
    }, SECTION_INTERVAL)
  }, [autoOn, goTo, stopTimer])

  useEffect(() => { restartTimer(cur) }, [cur, autoOn, restartTimer])

  const handleVideoEnded = useCallback(() => {
    if (!autoOn) return
    goTo(nextSection(curRef.current, 1), MODE_SECTION)
  }, [autoOn, goTo])

  // Keyboard + scroll + touch
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (autoOn) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') manualNav(1)
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  manualNav(-1)
    }
    let wLock = false
    const onWheel = (e: WheelEvent) => {
      if (autoOn || wLock) return
      wLock = true; setTimeout(() => { wLock = false }, 1000)
      manualNav(e.deltaY > 0 ? 1 : -1)
    }
    let tY: number | null = null
    const onTouchStart = (e: TouchEvent) => { tY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent) => {
      if (autoOn || tY === null) return
      const dy = tY - e.changedTouches[0].clientY
      if (Math.abs(dy) > 45) manualNav(dy > 0 ? 1 : -1)
      tY = null
    }
    window.addEventListener('keydown',    onKey)
    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      window.removeEventListener('keydown',    onKey)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [autoOn, manualNav])

  return (
    <>
      {/* ── Active section video ── */}
      {isVideoSection && (
        <HeroVideo
          ref={heroRef}
          active={isVideoActive}
          videoSrc={currentSection.videoSrc!}
          onEnded={holdForVideo ? handleVideoEnded : () => {}}
          onReady={() => {}}
          onFrame={v => captureVideoTexture(cur, v)}
        />
      )}

      <canvas ref={canvasRef} id="webgl-canvas" />
      <div className="scene-overlay" />

      <Navbar
        autoOn={autoOn}
        onToggleAuto={() => setAutoOn(p => !p)}
        onPageTransition={handlePageTransition}
      />
      <Sidebar
        currentIdx={cur}
        autoOn={autoOn}
        onNav={manualNav}
        onDotClick={(i) => goTo(i)}
        onContactOpen={() => handlePageTransition('/contact')}
        onDisableAuto={() => setAutoOn(false)}
      />

      {/* Center-bottom: action buttons */}
      <div className="fixed z-30 fade-in" style={{ bottom: isMobile ? 28 : 44, left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          {(['View All Projects', 'Contact Me'] as const).map((label) => (
            <button
              key={label}
              className="group relative overflow-hidden"
              onClick={() => handlePageTransition(label === 'Contact Me' ? '/contact' : '/work')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 50,
                padding: isMobile ? '8px 16px' : '10px 26px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow   = '0 0 18px rgba(255,255,255,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.boxShadow   = 'none'
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
                  borderRadius: 'inherit',
                }}
              />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: isMobile ? 9 : 10,
                fontWeight: 400,
                letterSpacing: isMobile ? '0.1em' : '0.18em',
                textTransform: 'uppercase',
                color: '#fff',
                position: 'relative',
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>


    </>
  )
}