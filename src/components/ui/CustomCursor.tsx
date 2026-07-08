import { useEffect, useRef, useState } from 'react'

const GOLD = '#D4AF37'

type CursorState = 'default' | 'active' | 'select' | 'loading' | 'unavailable' | 'drag' | 'resize'

// Elements that get the expanding gold "active" ring instead of the plain arrow.
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], label, [data-cursor-hover]'
// Opt-in small-badge states — any component can tag an element `data-cursor="select"` etc.
const SELECT_SELECTOR = '[data-cursor="select"]'
const DRAG_SELECTOR = '[data-cursor="drag"]'
const LOADING_SELECTOR = '[data-cursor="loading"], [aria-busy="true"]'
const UNAVAILABLE_SELECTOR = 'button:disabled, input:disabled, textarea:disabled, select:disabled, [aria-disabled="true"], [data-cursor="unavailable"]'
// Elements where we hand back the native cursor entirely (typing, iframes).
const NATIVE_SELECTOR = 'input, textarea, [contenteditable="true"], iframe'

const RESIZE_CORNER = 18 // px — how close to a textarea's bottom-right corner counts as "on the resize handle"

function badgeIcon(state: CursorState) {
  switch (state) {
    case 'select':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(6,6,8,0.9)" stroke={GOLD} strokeWidth={1.6} />
          <path d="M12 7v10M7 12h10" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'loading':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'cursorSpin 0.9s linear infinite' }}>
          <circle cx="12" cy="12" r="10" fill="rgba(6,6,8,0.9)" stroke="rgba(212,175,55,0.25)" strokeWidth={1.6} />
          <path d="M12 2a10 10 0 0 1 10 10" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'unavailable':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(6,6,8,0.9)" stroke={GOLD} strokeWidth={1.6} />
          <path d="M6 18 18 6" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      )
    case 'drag':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(6,6,8,0.9)" stroke={GOLD} strokeWidth={1.6} />
          <circle cx="12" cy="12" r="3.2" fill={GOLD} />
        </svg>
      )
    case 'resize':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(6,6,8,0.9)" stroke={GOLD} strokeWidth={1.6} />
          <path d="M8 16 16 8M11 8h5v5M13 16H8v-5" stroke={GOLD} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<CursorState>('default')
  const [native, setNative] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    // Only swap in a custom cursor for real mice/trackpads — touch devices
    // have no hover concept and should keep native (invisible) touch behavior.
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('custom-cursor-active')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let raf = 0
    let lastTarget: HTMLElement | null = null

    const applyPosition = () => {
      raf = 0
      const el = wrapRef.current
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const resolveState = (t: HTMLElement | null): { state: CursorState; native: boolean } => {
      if (!t) return { state: 'default', native: false }

      if (t.closest(LOADING_SELECTOR)) return { state: 'loading', native: false }
      if (t.closest(UNAVAILABLE_SELECTOR)) return { state: 'unavailable', native: false }

      // Resize only applies right over a textarea's own drag handle (bottom-right corner)
      const ta = t.closest('textarea') as HTMLTextAreaElement | null
      if (ta && getComputedStyle(ta).resize !== 'none') {
        const r = ta.getBoundingClientRect()
        if (x >= r.right - RESIZE_CORNER && y >= r.bottom - RESIZE_CORNER) {
          return { state: 'resize', native: false }
        }
      }

      // Whichever of these is *nearest* to the actual target wins — e.g. a real
      // <button> nested inside a `data-cursor="drag"` container should still
      // resolve to "active", not inherit the container's drag state.
      const nearest = t.closest(`${NATIVE_SELECTOR}, ${DRAG_SELECTOR}, ${SELECT_SELECTOR}, ${INTERACTIVE_SELECTOR}`)
      if (nearest) {
        if (nearest.matches(NATIVE_SELECTOR)) return { state: 'default', native: true }
        if (nearest.matches(DRAG_SELECTOR)) return { state: 'drag', native: false }
        if (nearest.matches(SELECT_SELECTOR)) return { state: 'select', native: false }
        return { state: 'active', native: false }
      }
      return { state: 'default', native: false }
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      setVisible(v => (v ? v : true))
      if (!raf) raf = requestAnimationFrame(applyPosition)
      // Re-resolve every move too (cheap), since the resize-corner check is position-dependent
      const r = resolveState(lastTarget)
      setState(r.state)
      setNative(r.native)
    }

    const onOver = (e: MouseEvent) => {
      lastTarget = e.target as HTMLElement
      const r = resolveState(lastTarget)
      setState(r.state)
      setNative(r.native)
    }

    const onLeaveDoc = () => setVisible(false)
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeaveDoc)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeaveDoc)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  const hovering = state === 'active'
  const badge = badgeIcon(state)

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        pointerEvents: 'none',
        opacity: visible && !native ? 1 : 0,
        transition: 'opacity 0.2s ease',
        willChange: 'transform',
      }}
    >
      {/* Default arrow — hotspot at its top-left tip, matching a native pointer */}
      <svg
        width="26" height="26" viewBox="0 0 26 26"
        style={{
          position: 'absolute', top: 0, left: 0,
          filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.55))',
          opacity: hovering ? 0 : 1,
          transform: `scale(${pressed ? 0.88 : 1})`,
          transition: 'opacity 0.2s ease, transform 0.15s ease',
        }}
      >
        <path
          d="M2 1.5 2 21 7.2 16.4 10.3 23.5 13.6 22 10.6 15 17 14.8Z"
          fill="rgba(6,6,8,0.85)" stroke={GOLD} strokeWidth={1.4} strokeLinejoin="round"
        />
      </svg>

      {/* Small badge — select / loading / unavailable / drag / resize — pinned near the arrow tip */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        opacity: badge ? 1 : 0,
        transform: `scale(${badge ? 1 : 0.5})`,
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.5))',
      }}>{badge}</div>

      {/* Active / hover ring — centered on the cursor */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 52, height: 52, borderRadius: '50%',
        transform: `translate(-50%, -50%) scale(${hovering ? (pressed ? 0.85 : 1) : 0.5})`,
        opacity: hovering ? 1 : 0,
        border: `1.5px solid ${GOLD}`,
        boxShadow: '0 0 16px 2px rgba(212,175,55,0.5), inset 0 0 12px rgba(212,175,55,0.25)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: GOLD, boxShadow: '0 0 8px 2px rgba(212,175,55,0.8)',
        }} />
      </div>

      <style>{`
        @keyframes cursorSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
