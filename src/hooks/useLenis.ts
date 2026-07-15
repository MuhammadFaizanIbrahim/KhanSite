import { useEffect } from 'react'
import type { RefObject } from 'react'
import Lenis from 'lenis'
import type { VirtualScrollData } from 'lenis'

declare global {
  interface Window { __lenis?: Lenis }
}

// Drives smooth scrolling for a given scrollable container (or the window if no
// ref is passed). The active instance is exposed on window.__lenis so anchor
// links (Sidebar, CenterNav, scroll cues) can call lenis.scrollTo() instead of
// fighting Lenis's rAF loop with native scrollIntoView/scrollTo. An optional
// virtualScroll callback can dampen wheel/touch delta before Lenis consumes it
// (e.g. to add scroll "resistance" over a specific section).
export function useLenis(ref?: RefObject<HTMLElement | null>, virtualScroll?: (data: VirtualScrollData) => boolean) {
  useEffect(() => {
    const wrapper = ref?.current
    if (ref && !wrapper) return

    const lenis = new Lenis({
      wrapper: wrapper ?? window,
      content: wrapper ?? document.documentElement,
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4,
      virtualScroll,
    })
    window.__lenis = lenis

    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      if (window.__lenis === lenis) window.__lenis = undefined
    }
  }, [ref])
}

// Smoothly scroll to a target (selector, element, or number) — uses the active
// Lenis instance when present, otherwise falls back to native smooth scrolling.
export function smoothScrollTo(target: string | HTMLElement | number, offset = 0) {
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: 'smooth' })
  }
}
