import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { STARFIELD_VERTEX_SHADER, STARFIELD_FRAGMENT_SHADER } from '@/data/shaders'

export interface PageTransitionHandle {
  play: (onMidpoint: () => void) => void
}

// Instanced streak count — kept modest since each streak already reads as far
// denser than a single point sprite would, so quality doesn't need volume.
const COUNT = 900
const DUR   = 1200

const StarfieldTransitionCanvas = forwardRef<PageTransitionHandle>(
  function StarfieldTransitionCanvas(_, ref) {
    const canvasRef  = useRef<HTMLCanvasElement>(null)
    const glRef      = useRef<WebGL2RenderingContext | null>(null)
    const uProgress_ = useRef<WebGLUniformLocation | null>(null)
    const uAspect_   = useRef<WebGLUniformLocation | null>(null)
    const rafRef     = useRef(0)
    const fadeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false }) as WebGL2RenderingContext | null
      if (!gl) return
      glRef.current = gl

      const mkShader = (type: number, src: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        return s
      }
      const prg = gl.createProgram()!
      gl.attachShader(prg, mkShader(gl.VERTEX_SHADER,   STARFIELD_VERTEX_SHADER))
      gl.attachShader(prg, mkShader(gl.FRAGMENT_SHADER, STARFIELD_FRAGMENT_SHADER))
      gl.linkProgram(prg)
      gl.useProgram(prg)

      // Shared unit "stick" quad — local x is across-width, local y 0→1 is tail→head.
      const cornerBuf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, 0, 0.5, 0, -0.5, 1, 0.5, 1]), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

      // Per-instance random seeds: xy position seed [-1,1], depth seed [0,1], brightness/size [0,1]
      const seeds = new Float32Array(COUNT * 4)
      for (let i = 0; i < COUNT; i++) {
        seeds[i * 4]     = Math.random() * 2 - 1
        seeds[i * 4 + 1] = Math.random() * 2 - 1
        seeds[i * 4 + 2] = Math.random()
        seeds[i * 4 + 3] = Math.random()
      }
      const seedBuf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf)
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(1)
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(1, 1)

      // Per-instance gold-tint chance — only a rare few streaks read as gold.
      const tints = new Float32Array(COUNT)
      for (let i = 0; i < COUNT; i++) tints[i] = Math.random()
      const tintBuf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, tintBuf)
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(2)
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(2, 1)

      uProgress_.current = gl.getUniformLocation(prg, 'uProgress')
      uAspect_.current   = gl.getUniformLocation(prg, 'uAspect')

      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE) // additive — fragment output is already alpha-premultiplied

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      return () => { cancelAnimationFrame(rafRef.current) }
    }, [])

    useImperativeHandle(ref, () => ({
      play(onMidpoint: () => void) {
        const gl     = glRef.current
        const canvas = canvasRef.current
        if (!gl || !canvas) { onMidpoint(); window.dispatchEvent(new Event('transition:done')); return }

        if (fadeTimer.current) { clearTimeout(fadeTimer.current); fadeTimer.current = null }
        cancelAnimationFrame(rafRef.current)
        canvas.style.transition = ''
        canvas.style.opacity    = '1'

        const dpr = Math.min(window.devicePixelRatio, 2)
        canvas.width  = Math.round(canvas.clientWidth  * dpr)
        canvas.height = Math.round(canvas.clientHeight * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)

        const start = performance.now()
        let navigated = false

        const loop = (ts: number) => {
          const raw = Math.min((ts - start) / DUR, 1)

          if (!navigated && raw >= 0.75) {
            navigated = true
            onMidpoint()
          }

          const w = Math.round(canvas.clientWidth  * dpr)
          const h = Math.round(canvas.clientHeight * dpr)
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h
            gl.viewport(0, 0, w, h)
          }

          // Opaque near-black clear fully covers the outgoing/incoming page
          // while streaks fly past, same as the previous dissolve transition.
          gl.clearColor(0.016, 0.024, 0.039, 1)
          gl.clear(gl.COLOR_BUFFER_BIT)

          gl.uniform1f(uProgress_.current, raw)
          gl.uniform1f(uAspect_.current, (w || 1) / (h || 1))
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, COUNT)

          if (raw < 1) {
            rafRef.current = requestAnimationFrame(loop)
          } else {
            canvas.style.transition = 'opacity 0.4s ease'
            canvas.style.opacity    = '0'
            fadeTimer.current = setTimeout(() => {
              // Left at opacity 0 (invisible, pointer-events already off) until the
              // next play() call resets it — no need to clear the GPU buffer back
              // to transparent since CSS opacity alone fully hides it either way.
              fadeTimer.current = null
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

export default StarfieldTransitionCanvas
