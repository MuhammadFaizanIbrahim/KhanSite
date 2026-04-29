import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTIONS, SECTION_INTERVAL } from '@/data/sections'
import { useWebGL, MODE_SECTION, MODE_PAGE } from '@/hooks/useWebGL'
import Navbar         from '@/components/layout/Navbar'
import Sidebar        from '@/components/layout/Sidebar'
import SlideText      from '@/components/sections/SlideText'
import HeroVideo, { HeroVideoHandle } from '@/components/sections/HeroVideo'
import ContactOverlay from '@/components/sections/ContactOverlay'

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
  const [videoReady, setVideoReady]   = useState(false)
  const [transActive, setTransActive] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  const curRef  = useRef(0)
  const progRef = useRef<HTMLDivElement>(null)
  const cdRef   = useRef<HTMLSpanElement>(null)
  const tStart  = useRef<number | null>(null)
  const rafT    = useRef(0)
  const toId    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heroRef = useRef<HeroVideoHandle>(null)

  // Hidden video elements for ALL sections — preloaded in background
  const bgVideoRefs = useRef<(HTMLVideoElement | null)[]>(
    new Array(SECTIONS.length).fill(null)
  )

  useEffect(() => { curRef.current = cur }, [cur])

  const {
    canvasRef, triggerTransition, setSkipDraw,
    snapshotVideoFrame, setLiveVideo, setIncomingVideo,
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
    setTimeout(() => navigate(path), 700)
  }, [triggerTransition, navigate])

  const goTo = useCallback((idx: number, mode = MODE_SECTION) => {
    if (idx === curRef.current) return
    if (SECTIONS[idx]?.isOverlay) { setContactOpen(true); return }

    setTransActive(true)
    setVideoReady(false)
    updateSkip(idx, true)
    triggerTransition(idx, mode)
    setCur(idx)

    const dur = mode === MODE_PAGE ? 700 : 1000
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
    if (progRef.current) progRef.current.style.width = '0%'
    if (cdRef.current)   cdRef.current.textContent   = '—'
  }, [])

  const restartTimer = useCallback((idx: number) => {
    stopTimer()
    if (!autoOn) return
    const sec = SECTIONS[idx]
    if (sec?.holdUntilVideoEnd) {
      if (cdRef.current)   cdRef.current.textContent   = '—'
      if (progRef.current) progRef.current.style.width = '0%'
      return
    }
    function tick(ts: number) {
      if (!tStart.current) tStart.current = ts
      const el  = ts - tStart.current
      const pct = Math.min((el / SECTION_INTERVAL) * 100, 100)
      if (progRef.current) progRef.current.style.width = pct + '%'
      if (cdRef.current)   cdRef.current.textContent   =
        String(Math.max(0, Math.ceil((SECTION_INTERVAL - el) / 1000)))
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

  const handleVideoReady = useCallback((_dur: number) => {
    setVideoReady(true)
  }, [])

  // Keyboard + scroll + touch
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (autoOn || contactOpen) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') manualNav(1)
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  manualNav(-1)
    }
    let wLock = false
    const onWheel = (e: WheelEvent) => {
      if (autoOn || wLock || contactOpen) return
      wLock = true; setTimeout(() => { wLock = false }, 1000)
      manualNav(e.deltaY > 0 ? 1 : -1)
    }
    let tY: number | null = null
    const onTouchStart = (e: TouchEvent) => { tY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent) => {
      if (autoOn || tY === null || contactOpen) return
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
  }, [autoOn, manualNav, contactOpen])

  return (
    <>
      {/* ── Hidden background videos for ALL video sections ──
          These load in the background so frames can be captured for WebGL textures.
          They are muted, paused, and invisible — purely for texture capture. */}
      <div style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none' }}>
        {SECTIONS.map((sec, i) => {
          if (!sec.isVideo || !sec.videoSrc) return null
          if (i === cur) return null // current section handled by HeroVideo below
          return (
            <video
              key={sec.videoSrc}
              ref={el => { bgVideoRefs.current[i] = el }}
              src={sec.videoSrc}
              muted playsInline preload="auto"
              style={{ width: 1, height: 1 }}
              onCanPlay={e => {
                const v = e.currentTarget
                captureVideoTexture(i, v)
              }}
            />
          )
        })}
      </div>

      {/* ── Active section video ── */}
      {isVideoSection && (
        <HeroVideo
          ref={heroRef}
          active={isVideoActive}
          videoSrc={currentSection.videoSrc!}
          onEnded={holdForVideo ? handleVideoEnded : () => {}}
          onReady={handleVideoReady}
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
        onContactOpen={() => setContactOpen(true)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-30 px-20 pb-11 flex items-end justify-between fade-in">
        <SlideText section={SECTIONS[cur]} />
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="font-inter text-[10px] text-white/22 tracking-[0.06em] whitespace-nowrap">
            {holdForVideo
              ? (videoReady ? 'Playing...' : 'Loading...')
              : <>Next in <span ref={cdRef}>5</span>s</>
            }
          </span>
          <div className="w-20 h-px bg-white/8 overflow-hidden">
            <div ref={progRef} className="prog-fill" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      <ContactOverlay
        visible={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  )
}