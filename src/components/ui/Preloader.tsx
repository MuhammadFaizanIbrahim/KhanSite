import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'
import BackgroundMedia from '@/components/ui/BackgroundMedia'
import GalaxyBackground from '@/components/ui/GalaxyBackground'

interface PreloaderProps { onComplete: () => void }

type AssetType = 'image' | 'video'
interface ManifestAsset { url: string; type: AssetType }

// Minimum time so the text animation fully plays before exit is allowed
const MIN_ANIM_MS   = 2800
// Per-asset fallback: unblock if a single asset stalls on very slow connections
const ASSET_TIMEOUT = 14000
// Hard cap: never show preloader longer than this regardless of anything
const HARD_TIMEOUT  = 28000
// Font fallback: don't let font detection block loading
const FONT_TIMEOUT  = 4000

export default function Preloader({ onComplete }: PreloaderProps) {
  const content = useContent('preloader')
  const [pct, setPct]         = useState(0)
  const [khanIn, setKhanIn]   = useState(false)
  const [subIn, setSubIn]     = useState(false)
  const [tagIn, setTagIn]     = useState(false)

  // Exit gate: all three must be true before exit is allowed
  const wLoaded       = useRef(0)
  const wTotal        = useRef(1) // fonts unit; grows once the asset manifest resolves
  const animDone      = useRef(false)
  const assetsDone    = useRef(false)
  const fontsDone     = useRef(false)
  const exitTriggered = useRef(false)

  useEffect(() => {
    let cancelled = false

    // ── Exit logic ────────────────────────────────────────────────────────────
    const doExit = () => {
      if (exitTriggered.current) return
      exitTriggered.current = true
      setPct(100)
      // The page-transition canvas takes over the visual handoff from here (covers
      // the screen with the same dissolve effect used between pages), so this only
      // needs a brief pause for "100%" to register before handing off.
      setTimeout(onComplete, 250)
    }

    const tryExit = () => {
      if (animDone.current && assetsDone.current && fontsDone.current) doExit()
    }

    // Credit a weight unit toward real progress (display is paced separately by the ticker below)
    const credit = (w = 1) => {
      wLoaded.current = Math.min(wLoaded.current + w, wTotal.current)
      tryExit()
    }

    // ── Displayed % ticker ──
    // Assets on a fast connection (or from cache) can finish in a few ms, which would
    // make the bar jump straight to 100 with no visible counting. Pace the number shown
    // to the slower of "real load ratio" and "time elapsed since mount" so it always
    // visibly counts 0 → 100 instead of snapping — with no CSS easing, just stepped values.
    const startTime = Date.now()
    const tick = () => {
      const timeRatio = Math.min(1, (Date.now() - startTime) / MIN_ANIM_MS)
      const realRatio = wTotal.current > 0 ? wLoaded.current / wTotal.current : 0
      const shown = Math.round(Math.min(timeRatio, realRatio) * 100)
      setPct(prev => (shown > prev ? shown : prev))
    }
    const tTick = setInterval(tick, 60)

    // ── Text animation sequence ───────────────────────────────────────────────
    const t1    = setTimeout(() => setKhanIn(true),  300)
    const t2    = setTimeout(() => setSubIn(true),  1350)
    const t3    = setTimeout(() => setTagIn(true),  1900)
    const tAnim = setTimeout(() => { animDone.current = true; tryExit() }, MIN_ANIM_MS)

    // ── Font loading ──────────────────────────────────────────────────────────
    const markFonts = () => {
      if (fontsDone.current) return
      fontsDone.current = true
      credit(1)
    }
    document.fonts.ready.then(markFonts)
    const tFonts = setTimeout(markFonts, FONT_TIMEOUT) // fallback

    // ── Asset loading — driven by the auto-generated manifest of every file  ──
    // ── under public/images and public/videos (see vite.config.ts)          ──
    const holder = document.createElement('div')
    holder.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:1px', 'height:1px',
      'opacity:0', 'pointer-events:none',
      'overflow:hidden', 'z-index:-1',
    ].join(';')
    document.body.appendChild(holder)

    const assetTimeouts: ReturnType<typeof setTimeout>[] = []

    const loadAssets = (assets: ManifestAsset[]) => {
      if (cancelled) return
      if (!assets.length) { assetsDone.current = true; tryExit(); return }

      wTotal.current += assets.length
      let remaining = assets.length

      const markAsset = () => {
        remaining -= 1
        credit(1)
        if (remaining <= 0) { assetsDone.current = true; tryExit() }
      }

      assets.forEach(({ url, type }) => {
        let settled = false
        const done = () => { if (settled) return; settled = true; markAsset() }

        if (type === 'video') {
          const v = document.createElement('video')
          v.muted       = true
          v.playsInline = true
          v.preload     = 'auto'
          v.src         = url
          holder.appendChild(v)
          v.addEventListener('canplay', done, { once: true })
          v.addEventListener('error',   done, { once: true })
          v.load()
        } else {
          const img = new Image()
          img.onload  = done
          img.onerror = done
          img.src = url
        }

        assetTimeouts.push(setTimeout(done, ASSET_TIMEOUT))
      })
    }

    fetch('/asset-manifest.json')
      .then(r => (r.ok ? r.json() : []))
      .then((assets: ManifestAsset[]) => loadAssets(Array.isArray(assets) ? assets : []))
      .catch(() => loadAssets([]))

    // Absolute hard cap — nothing blocks the user longer than HARD_TIMEOUT
    const tHard = setTimeout(doExit, HARD_TIMEOUT)

    return () => {
      cancelled = true
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(tAnim); clearTimeout(tFonts)
      clearTimeout(tHard); clearInterval(tTick)
      assetTimeouts.forEach(clearTimeout)
      // Remove holder but keep src intact so browser HTTP cache is preserved
      if (document.body.contains(holder)) document.body.removeChild(holder)
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      backgroundColor: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <GalaxyBackground position="absolute" />
      <BackgroundMedia background={content.background} />

      {/* ── Centered content stack ── */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo mark — aspectRatio reserves its height up front (matching the
            image's real 1774:887 proportions), so the text/progress bar below
            don't render a moment early in a higher spot then jump down once
            the logo file finishes loading and its box actually gets sized. */}
        <img
          src="/images/logos/logo-1024.png"
          alt="KhanConcepts"
          style={{
            width: 'clamp(160px, 22vw, 300px)',
            aspectRatio: '1774 / 887',
            height: 'auto',
            opacity: khanIn ? 1 : 0,
            filter: khanIn ? 'blur(0px)' : 'blur(16px)',
            transform: khanIn ? 'scale(1)' : 'scale(0.9)',
            transition: 'opacity 1s ease, filter 1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* ── "KhanConcepts" — per-letter blur materialise ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 4 }}>
          {'KhanConcepts'.split('').map((ch, i) => (
            <span key={i} style={{
              fontFamily:    "'Playfair Display', serif",
              fontVariant:   'small-caps',
              fontSize:      'clamp(38px, 5.6vw, 68px)',
              fontWeight:    600,
              color:         'var(--text-primary)',
              letterSpacing: '0.01em',
              display:       'inline-block',
              opacity:       khanIn ? 1 : 0,
              filter:        khanIn ? 'blur(0px)' : 'blur(22px)',
              transform:     khanIn ? 'scale(1)' : 'scale(0.86)',
              transition:    khanIn
                ? `opacity 1.1s ease ${i * 70}ms, filter 1.1s ease ${i * 70}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`
                : 'none',
            }}>{ch}</span>
          ))}
        </div>

        {/* ── "CONCEPT INNOVATION" ── */}
        <span style={{
          fontFamily:    "'Cinzel', serif",
          fontSize:      'clamp(10px, 1.1vw, 13px)',
          fontWeight:    500,
          color:         'var(--text-gold)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          marginTop:     6,
          display:       'block',
          opacity:       subIn ? 1 : 0,
          filter:        subIn ? 'blur(0px)' : 'blur(10px)',
          transition:    'opacity 1s ease, filter 1s ease',
        }}>{content.conceptLabel}</span>

        {/* ── Tagline ── */}
        <div style={{
          marginTop:  14,
          textAlign:  'center',
          fontFamily: "'Playfair Display', serif",
          fontSize:   'clamp(15px, 2vw, 22px)',
          fontWeight: 400,
          color:      'var(--text-primary)',
          lineHeight: 1.5,
          opacity:    tagIn ? 1 : 0,
          filter:     tagIn ? 'blur(0px)' : 'blur(6px)',
          transition: 'opacity 1.1s ease, filter 1.1s ease',
        }}>
          <div><RichText text={content.taglineLine1} /></div>
          <div><RichText text={content.taglineLine2} /></div>
        </div>

        {/* ── Progress bar — present from the first frame, no fade-in or width easing ── */}
        <div style={{
          marginTop: 20,
          display:   'flex', flexDirection: 'column',
          gap: 10, width: 'min(420px, 60vw)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 500,
              letterSpacing: '0.3em', color: 'var(--text-gold)',
            }}>{content.loadingLabel}</span>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', color: 'var(--text-gold)',
            }}>{pct}%</span>
          </div>
          <div style={{
            width: '100%', height: 2,
            background: 'rgba(212,175,55,0.15)',
            overflow: 'hidden', borderRadius: 2,
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, rgba(212,175,55,0.4), #D4AF37)',
              width: `${pct}%`,
              boxShadow: '0 0 8px rgba(212,175,55,0.6)',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
