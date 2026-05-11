import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '@/data/sections'

interface PreloaderProps { onComplete: () => void }

// Minimum time so the text animation fully plays before exit is allowed
const MIN_ANIM_MS   = 2800
// Per-video fallback: unblock if first video stalls on very slow connections
const VID0_TIMEOUT  = 14000
// Hard cap: never show preloader longer than this regardless of anything
const HARD_TIMEOUT  = 28000
// Font fallback: don't let font detection block loading
const FONT_TIMEOUT  = 4000

// Unique video URLs in section order — hero.mp4 is index 0 (the critical one)
const VIDEO_URLS = [...new Set(
  SECTIONS.filter(s => s.videoSrc).map(s => s.videoSrc!)
)]

// Weighted progress: first video is most critical (4×), fonts and other videos are 1× each
const W_FONTS = 1
const W_FIRST = 4
const W_OTHER = 1
const W_TOTAL = W_FONTS + W_FIRST + (VIDEO_URLS.length - 1) * W_OTHER

export default function Preloader({ onComplete }: PreloaderProps) {
  const [pct, setPct]         = useState(0)
  const [khanIn, setKhanIn]   = useState(false)
  const [subIn, setSubIn]     = useState(false)
  const [tagIn, setTagIn]     = useState(false)
  const [exiting, setExiting] = useState(false)

  // Exit gate: all three must be true before exit is allowed
  const wLoaded       = useRef(0)
  const animDone      = useRef(false)
  const firstVidDone  = useRef(false)
  const fontsDone     = useRef(false)
  const exitTriggered = useRef(false)

  useEffect(() => {
    // ── Exit logic ────────────────────────────────────────────────────────────
    const doExit = () => {
      if (exitTriggered.current) return
      exitTriggered.current = true
      setPct(100)
      setTimeout(() => { setExiting(true); setTimeout(onComplete, 900) }, 200)
    }

    const tryExit = () => {
      if (animDone.current && firstVidDone.current && fontsDone.current) doExit()
    }

    // Credit a weight unit toward progress and attempt exit
    const credit = (w: number) => {
      wLoaded.current = Math.min(wLoaded.current + w, W_TOTAL)
      setPct(Math.round((wLoaded.current / W_TOTAL) * 100))
      tryExit()
    }

    // ── Text animation sequence ───────────────────────────────────────────────
    const t1    = setTimeout(() => setKhanIn(true),  300)
    const t2    = setTimeout(() => setSubIn(true),  1350)
    const t3    = setTimeout(() => setTagIn(true),  1900)
    const tAnim = setTimeout(() => { animDone.current = true; tryExit() }, MIN_ANIM_MS)

    // ── Font loading ──────────────────────────────────────────────────────────
    const markFonts = () => {
      if (fontsDone.current) return
      fontsDone.current = true
      credit(W_FONTS)
    }
    document.fonts.ready.then(markFonts)
    const tFonts = setTimeout(markFonts, FONT_TIMEOUT) // fallback

    // ── Video preloading ──────────────────────────────────────────────────────
    // Hidden container in body — required for mobile browsers to actually buffer
    const holder = document.createElement('div')
    holder.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:1px', 'height:1px',
      'opacity:0', 'pointer-events:none',
      'overflow:hidden', 'z-index:-1',
    ].join(';')
    document.body.appendChild(holder)

    const credited = new Set<number>()

    VIDEO_URLS.forEach((url, i) => {
      const v = document.createElement('video')
      v.muted       = true
      v.playsInline = true
      v.preload     = 'auto'
      v.src         = url
      holder.appendChild(v)

      const mark = () => {
        if (credited.has(i)) return
        credited.add(i)
        if (i === 0) { firstVidDone.current = true; credit(W_FIRST) }
        else credit(W_OTHER)
      }

      // canplay = enough data to start playback — sufficient to unblock
      v.addEventListener('canplay',        mark, { once: true })
      v.addEventListener('canplaythrough', mark, { once: true })
      // Treat error as "done" so a missing file doesn't block forever
      v.addEventListener('error',          mark, { once: true })
      v.load()
    })

    // First-video fallback on very slow connections
    const tVid0 = setTimeout(() => {
      if (!firstVidDone.current) { firstVidDone.current = true; credit(W_FIRST) }
    }, VID0_TIMEOUT)

    // Absolute hard cap — nothing blocks the user longer than HARD_TIMEOUT
    const tHard = setTimeout(doExit, HARD_TIMEOUT)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(tAnim); clearTimeout(tFonts)
      clearTimeout(tVid0); clearTimeout(tHard)
      // Remove holder but keep src intact so browser HTTP cache is preserved
      if (document.body.contains(holder)) document.body.removeChild(holder)
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.7s ease-in-out',
      pointerEvents: exiting ? 'none' : 'auto',
    }}>

      {/* ── "Khan" — per-letter blur materialise ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        {'Khan'.split('').map((ch, i) => (
          <span key={i} style={{
            fontFamily:    '"Playfair Display", serif',
            fontSize:      'clamp(64px, 10vw, 120px)',
            fontWeight:    700,
            color:         '#fff',
            letterSpacing: '0.02em',
            display:       'inline-block',
            opacity:       khanIn ? 1 : 0,
            filter:        khanIn ? 'blur(0px)' : 'blur(22px)',
            transform:     khanIn ? 'scale(1)' : 'scale(0.86)',
            transition:    khanIn
              ? `opacity 1.1s ease ${i * 110}ms, filter 1.1s ease ${i * 110}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`
              : 'none',
          }}>{ch}</span>
        ))}
      </div>

      {/* ── "TheUnseen" — blur-in + letter-spacing expand ── */}
      <div style={{ marginTop: 6 }}>
        <span style={{
          fontFamily:    '"Manrope", sans-serif',
          fontSize:      'clamp(28px, 4.5vw, 56px)',
          fontWeight:    300,
          color:         'rgba(255,255,255,0.5)',
          lineHeight:    1,
          display:       'block',
          opacity:       subIn ? 1 : 0,
          filter:        subIn ? 'blur(0px)' : 'blur(14px)',
          letterSpacing: subIn ? '0.14em' : '0em',
          transition:    'opacity 1s ease, filter 1s ease, letter-spacing 1.3s cubic-bezier(0.16,1,0.3,1)',
        }}>TheUnseen</span>
      </div>

      {/* ── Tagline — blur fade ── */}
      <span style={{
        fontFamily:    '"Manrope", sans-serif',
        fontSize:      'clamp(11px, 1.3vw, 15px)',
        fontWeight:    300,
        color:         'rgba(255,255,255,0.32)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginTop:     16,
        display:       'block',
        opacity:       tagIn ? 1 : 0,
        filter:        tagIn ? 'blur(0px)' : 'blur(6px)',
        transition:    'opacity 1.1s ease, filter 1.1s ease',
      }}>I innovate concepts that redefine industries.</span>

      {/* ── Progress bar — driven by real asset loading ── */}
      <div style={{
        position:  'absolute', bottom: '10%', left: '50%',
        transform: 'translateX(-50%)',
        display:   'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10, width: 240,
      }}>
        <div style={{
          width: '100%', height: 1,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden', borderRadius: 1,
        }}>
          <div style={{
            height: '100%', background: '#fff',
            width: `${pct}%`,
            transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      11, fontWeight: 500,
          letterSpacing: '0.22em',
          color:         'rgba(255,255,255,0.22)',
        }}>{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  )
}
