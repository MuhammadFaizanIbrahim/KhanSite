import { useState, useEffect } from 'react'

export function useBreakpoint() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn, { passive: true })
    return () => window.removeEventListener('resize', fn)
  }, [])
  return {
    isMobile: w < 640,
    isTablet: w < 1024,
    width: w,
  }
}
