import { useEffect, useRef, useState } from 'react'

const GOLD = '#D4AF37'

type CursorState = 'default' | 'active'

// Anything clickable/openable gets the circle — real interactive elements,
// plus any component opting in via `data-cursor-hover` or `data-cursor="..."`
// (the old select/drag/loading badge system collapsed into this one state).
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], label, [data-cursor-hover], [data-cursor]'
const UNAVAILABLE_SELECTOR = 'button:disabled, input:disabled, textarea:disabled, select:disabled, [aria-disabled="true"]'
// Elements where we hand back the native cursor entirely (typing, iframes).
const NATIVE_SELECTOR = 'input, textarea, [contenteditable="true"], iframe'

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

    const applyPosition = () => {
      raf = 0
      const el = wrapRef.current
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const resolveState = (t: HTMLElement | null): { state: CursorState; native: boolean } => {
      if (!t) return { state: 'default', native: false }
      if (t.closest(UNAVAILABLE_SELECTOR)) return { state: 'default', native: false }

      const nearest = t.closest(`${NATIVE_SELECTOR}, ${INTERACTIVE_SELECTOR}`)
      if (nearest) {
        if (nearest.matches(NATIVE_SELECTOR)) return { state: 'default', native: true }
        return { state: 'active', native: false }
      }
      return { state: 'default', native: false }
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      setVisible(v => (v ? v : true))
      if (!raf) raf = requestAnimationFrame(applyPosition)
      const r = resolveState(e.target as HTMLElement)
      setState(r.state)
      setNative(r.native)
    }

    const onOver = (e: MouseEvent) => {
      const r = resolveState(e.target as HTMLElement)
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

      {/* Hover ring — centered on the cursor, shown over anything clickable/openable */}
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
    </div>
  )
}
