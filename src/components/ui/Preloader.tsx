import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '@/data/sections'

interface PreloaderProps {
  onComplete: () => void
}

const IMAGE_URLS    = SECTIONS.map(s => s.img)
const FONT_FAMILIES = ['Playfair Display', 'Manrope', 'Inter']

// Minimum time the preloader stays visible (ms)
const MIN_DURATION = 3800
// How long the animated bar takes to reach 100% (drives the visual counter)
const ANIM_DURATION = 3200

export default function Preloader({ onComplete }: PreloaderProps) {
  const [displayPct, setDisplayPct] = useState(0)   // what the user sees
  const [textVisible, setTextVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // track real asset loading separately
  const assetsLoaded  = useRef(false)
  const loadedCount   = useRef(0)
  const totalAssets   = IMAGE_URLS.length + FONT_FAMILIES.length

  // track minimum time
  const minTimeDone   = useRef(false)
  const exitTriggered = useRef(false)

  const tryExit = () => {
    if (assetsLoaded.current && minTimeDone.current && !exitTriggered.current) {
      exitTriggered.current = true
      // animate counter to 100 if not already there, then exit
      setDisplayPct(100)
      setTimeout(() => {
        setExiting(true)
        setTimeout(onComplete, 800)
      }, 500)
    }
  }

  const onAssetLoaded = () => {
    loadedCount.current++
    if (loadedCount.current >= totalAssets) {
      assetsLoaded.current = true
      tryExit()
    }
  }

  useEffect(() => {
    // 1. show text lines
    const tText = setTimeout(() => setTextVisible(true), 120)

    // 2. animate the progress counter smoothly over ANIM_DURATION
    //    uses requestAnimationFrame so it's perfectly smooth
    let rafId: number
    const animStart = performance.now()

    function animateCounter(now: number) {
      const elapsed = now - animStart
      const raw     = Math.min(elapsed / ANIM_DURATION, 1)
      // ease-out cubic so it decelerates near 100
      const eased   = 1 - Math.pow(1 - raw, 3)
      const pct     = Math.floor(eased * 100)
      setDisplayPct(pct)
      if (raw < 1) {
        rafId = requestAnimationFrame(animateCounter)
      }
    }
    rafId = requestAnimationFrame(animateCounter)

    // 3. minimum visible time gate
    const tMin = setTimeout(() => {
      minTimeDone.current = true
      tryExit()
    }, MIN_DURATION)

    // 4. preload real assets
    IMAGE_URLS.forEach(url => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload  = onAssetLoaded
      img.onerror = onAssetLoaded
      img.src = url
    })
    FONT_FAMILIES.forEach(name => {
      document.fonts.load(`16px "${name}"`).then(onAssetLoaded).catch(onAssetLoaded)
    })

    return () => {
      clearTimeout(tText)
      clearTimeout(tMin)
      cancelAnimationFrame(rafId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`
        fixed inset-0 z-50 bg-black flex flex-col items-center justify-center
        transition-opacity duration-700 ease-in-out
        ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      <div className="flex flex-col items-center gap-6 select-none">

        {/* Khan */}
        <div className="preloader-line">
          <span
            className={`preloader-line-inner font-playfair text-white leading-none tracking-wide ${textVisible ? 'visible' : ''}`}
            style={{ fontSize: 'clamp(64px,10vw,120px)', transitionDelay: '0s' }}
          >
            Khan
          </span>
        </div>

        {/* TheUnseen */}
        <div className="preloader-line" style={{ marginTop: '-8px' }}>
          <span
            className={`preloader-line-inner font-manrope font-light text-white/50 leading-none tracking-[0.12em] ${textVisible ? 'visible' : ''}`}
            style={{ fontSize: 'clamp(28px,4.5vw,56px)', transitionDelay: '0.14s' }}
          >
            TheUnseen
          </span>
        </div>

        {/* Tagline */}
        <div className="preloader-line mt-4">
          <span
            className={`preloader-line-inner font-subtitle text-white/35 tracking-[0.15em] uppercase font-light ${textVisible ? 'visible' : ''}`}
            style={{ fontSize: 'clamp(11px,1.3vw,15px)', transitionDelay: '0.28s' }}
          >
            I innovate concepts that redefine industries.
          </span>
        </div>

        {/* Progress bar */}
        <div
          className={`preloader-line w-60 mt-10 ${textVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.42s' }}
        >
          <div className="w-full h-px bg-white/10 overflow-hidden rounded-full">
            <div
              className="preloader-bar-fill h-full rounded-full"
              style={{ width: `${displayPct}%`, transition: 'width 0.08s linear' }}
            />
          </div>
        </div>

        {/* Counter */}
        <div className="preloader-line">
          <span
            className={`preloader-line-inner font-inter text-white/22 text-[11px] tracking-[0.22em] font-medium ${textVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.52s' }}
          >
            {String(displayPct).padStart(3, '0')}%
          </span>
        </div>

      </div>
    </div>
  )
}