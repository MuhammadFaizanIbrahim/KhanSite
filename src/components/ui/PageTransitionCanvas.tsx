import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { VERTEX_SHADER, FRAGMENT_SHADER } from '@/data/shaders'

export interface PageTransitionHandle {
  play: (onMidpoint: () => void, texture?: 'hero' | 'preloader') => void
}

const PageTransitionCanvas = forwardRef<PageTransitionHandle>(
  function PageTransitionCanvas(_, ref) {
    const canvasRef   = useRef<HTMLCanvasElement>(null)
    const glRef       = useRef<WebGLRenderingContext | null>(null)
    const uA_         = useRef<WebGLUniformLocation | null>(null)
    const uB_         = useRef<WebGLUniformLocation | null>(null)
    const uP_         = useRef<WebGLUniformLocation | null>(null)
    const uT_         = useRef<WebGLUniformLocation | null>(null)
    const uAR_        = useRef<WebGLUniformLocation | null>(null)
    const uMode_      = useRef<WebGLUniformLocation | null>(null)
    const uImgAR_     = useRef<WebGLUniformLocation | null>(null)
    const texDark     = useRef<WebGLTexture | null>(null)
    const texHeroD    = useRef<WebGLTexture | null>(null)
    const texHeroM    = useRef<WebGLTexture | null>(null)
    const texPreload  = useRef<WebGLTexture | null>(null)
    const arHeroD     = useRef(16 / 9)
    const arHeroM     = useRef(9 / 16)
    const arPreload   = useRef(16 / 9)
    const texChoice   = useRef<'hero' | 'preloader'>('hero')
    const rafRef      = useRef(0)
    const fadeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const gl = (
        canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
        canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false })
      ) as WebGLRenderingContext
      if (!gl) return
      glRef.current = gl

      const mkShader = (type: number, src: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        return s
      }
      const prg = gl.createProgram()!
      gl.attachShader(prg, mkShader(gl.VERTEX_SHADER,   VERTEX_SHADER))
      gl.attachShader(prg, mkShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
      gl.linkProgram(prg)
      gl.useProgram(prg)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
      const aLoc = gl.getAttribLocation(prg, 'a')
      gl.enableVertexAttribArray(aLoc)
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)

      uA_.current    = gl.getUniformLocation(prg, 'uA')
      uB_.current    = gl.getUniformLocation(prg, 'uB')
      uP_.current    = gl.getUniformLocation(prg, 'uP')
      uT_.current    = gl.getUniformLocation(prg, 'uT')
      uAR_.current   = gl.getUniformLocation(prg, 'uAR')
      uMode_.current = gl.getUniformLocation(prg, 'uMode')
      uImgAR_.current = gl.getUniformLocation(prg, 'uImgAR')

      // Near-black 1×1 texture matching the site's dark background
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([4, 6, 10, 255]))
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      texDark.current = t

      // Dissolve target images — the dissolve reveals/hides these instead of flat color.
      // Each starts as the same 1×1 dark pixel, upgraded in place once the image decodes.
      const loadImageTex = (url: string, arRef: { current: number }) => {
        const tex = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          new Uint8Array([4, 6, 10, 255]))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        const img = new Image()
        img.onload = () => {
          arRef.current = img.naturalWidth / img.naturalHeight
          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        }
        img.src = url
        return tex
      }
      texHeroD.current   = loadImageTex('/images/hero%20bg%20desktop.png', arHeroD)
      texHeroM.current   = loadImageTex('/images/hero%20bg%20mobile.png',  arHeroM)
      texPreload.current = loadImageTex('/images/preloader%20bg.png',      arPreload)

      // Start transparent
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      return () => { cancelAnimationFrame(rafRef.current) }
    }, [])

    useImperativeHandle(ref, () => ({
      play(onMidpoint: () => void, texture: 'hero' | 'preloader' = 'hero') {
        const gl     = glRef.current
        const canvas = canvasRef.current
        if (!gl || !canvas) { onMidpoint(); window.dispatchEvent(new Event('transition:done')); return }
        texChoice.current = texture

        // Cancel any in-progress fade/animation
        if (fadeTimer.current) { clearTimeout(fadeTimer.current); fadeTimer.current = null }
        cancelAnimationFrame(rafRef.current)
        canvas.style.transition = ''
        canvas.style.opacity    = '1'

        // Immediately paint opaque to cover the current page before the RAF fires
        const dpr = Math.min(window.devicePixelRatio, 2)
        canvas.width  = Math.round(canvas.clientWidth  * dpr)
        canvas.height = Math.round(canvas.clientHeight * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const DUR   = 1200
        const start = performance.now()
        let glTime  = 0
        let lastF: number | null = null
        let navigated = false

        const loop = (ts: number) => {
          if (!lastF) lastF = ts
          glTime += (ts - lastF) * 0.001
          lastF = ts

          const raw = Math.min((ts - start) / DUR, 1)

          let p: number
          if (raw < 0.3) {
            p = (raw / 0.3) * (raw / 0.3) * 0.3
          } else {
            const r = (raw - 0.3) / 0.7
            p = 0.3 + r * r * (2.8 - r * 1.1) * 0.7
          }
          p = Math.min(p, 1)

          // Navigate at 75% — same timing as HOME→WORK
          if (!navigated && raw >= 0.75) {
            navigated = true
            onMidpoint()
          }

          // Resize
          const w = Math.round(canvas.clientWidth  * dpr)
          const h = Math.round(canvas.clientHeight * dpr)
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h
            gl.viewport(0, 0, w, h)
          }

          const ar = (w || 1) / (h || 1)
          gl.clearColor(0, 0, 0, 1)
          gl.clear(gl.COLOR_BUFFER_BIT)

          const isMobile = window.innerWidth < 640
          let texB: WebGLTexture | null
          let imgAR: number
          if (texChoice.current === 'preloader') {
            texB  = texPreload.current
            imgAR = arPreload.current
          } else {
            texB  = isMobile ? texHeroM.current : texHeroD.current
            imgAR = isMobile ? arHeroM.current  : arHeroD.current
          }

          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, texDark.current)
          gl.uniform1i(uA_.current, 0)

          gl.activeTexture(gl.TEXTURE1)
          gl.bindTexture(gl.TEXTURE_2D, texB)
          gl.uniform1i(uB_.current, 1)

          gl.uniform1f(uP_.current,    p)
          gl.uniform1f(uT_.current,    glTime)
          gl.uniform1f(uAR_.current,   ar)
          gl.uniform1f(uImgAR_.current, imgAR)
          gl.uniform1f(uMode_.current, 0) // sectionDissolve — organic noise dissolve

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

          if (raw < 1) {
            rafRef.current = requestAnimationFrame(loop)
          } else {
            // Fade canvas out, then reset to transparent idle state
            canvas.style.transition = 'opacity 0.4s ease'
            canvas.style.opacity    = '0'
            fadeTimer.current = setTimeout(() => {
              gl.clearColor(0, 0, 0, 0)
              gl.clear(gl.COLOR_BUFFER_BIT)
              canvas.style.transition = ''
              canvas.style.opacity    = '1'
              fadeTimer.current = null
              // Screen is now fully clear — let entrance animations on the revealed page start
              window.dispatchEvent(new Event('transition:done'))
            }, 440)
          }
        }

        rafRef.current = requestAnimationFrame(loop)
      },
    }))

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0,
          width: '100%', height: '100%',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
    )
  }
)

export default PageTransitionCanvas
