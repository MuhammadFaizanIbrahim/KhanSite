import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

export interface HeroVideoHandle {
  isReady:    () => boolean
  getVideoEl: () => HTMLVideoElement | null
}

interface HeroVideoProps {
  active:    boolean
  videoSrc:  string
  onEnded:   () => void
  onReady:   (dur: number) => void
  onFrame?:  (v: HTMLVideoElement) => void  // called when first frame is available
}

const HeroVideo = forwardRef<HeroVideoHandle, HeroVideoProps>(
  ({ active, videoSrc, onEnded, onReady, onFrame }, ref) => {
    const videoRef               = useRef<HTMLVideoElement>(null)
    const [loaded, setLoaded]    = useState(false)
    const [hasError, setHasError]= useState(false)
    const frameCaptured          = useRef(false)

    useImperativeHandle(ref, () => ({
      isReady:    () => loaded,
      getVideoEl: () => videoRef.current,
    }))

    // Reset when src changes
    useEffect(() => {
      setLoaded(false)
      setHasError(false)
      frameCaptured.current = false
    }, [videoSrc])

    // Play / pause
    useEffect(() => {
      const v = videoRef.current
      if (!v) return
      if (active) {
        v.currentTime = 0
        v.muted = true
        v.play().catch(() => {
          const retry = () => { v.muted = true; v.play().catch(() => {}); cleanup() }
          const cleanup = () => {
            window.removeEventListener('click',      retry)
            window.removeEventListener('touchstart', retry)
          }
          window.addEventListener('click',      retry, { once: true })
          window.addEventListener('touchstart', retry, { once: true })
        })
      } else {
        v.pause()
      }
    }, [active])

    // Once video can play, grab the first frame for WebGL texture
    const handleCanPlay = () => {
      const v = videoRef.current
      if (!v) return
      setLoaded(true)
      onReady(v.duration || 30)
      if (active) { v.muted = true; v.play().catch(() => {}) }
      // Capture frame for WebGL (only once per src)
      if (!frameCaptured.current && onFrame) {
        frameCaptured.current = true
        onFrame(v)
      }
    }

    const handleLoadedMetadata = () => {
      const v = videoRef.current
      if (!v) return
      setLoaded(true)
      onReady(v.duration || 30)
      if (active) { v.muted = true; v.play().catch(() => {}) }
    }

    return (
      <div className="fixed inset-0 z-0 bg-black overflow-hidden">
        {/* Dark animated fallback */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: loaded && !hasError ? 0 : 1,
            background: `radial-gradient(ellipse 80% 60% at 50% 40%,
              rgba(20,20,40,1) 0%, rgba(8,8,16,1) 55%, rgba(0,0,0,1) 100%)`,
          }}
        >
          <div className="absolute rounded-full" style={{
            width:'60vw',height:'60vw',top:'50%',left:'50%',
            transform:'translate(-50%,-55%)',
            background:'radial-gradient(circle, rgba(30,30,70,0.6) 0%, transparent 70%)',
            animation:'heroOrb 6s ease-in-out infinite',
          }}/>
          <style>{`@keyframes heroOrb{0%,100%{transform:translate(-50%,-55%) scale(1);opacity:.6}50%{transform:translate(-50%,-55%) scale(1.12);opacity:1}}`}</style>
        </div>

        {!hasError && (
          <video
            ref={videoRef}
            key={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1.2s ease' }}
            src={videoSrc}
            muted playsInline preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onEnded={onEnded}
            onError={() => setHasError(true)}
          />
        )}
      </div>
    )
  }
)
HeroVideo.displayName = 'HeroVideo'
export default HeroVideo