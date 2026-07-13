import { useEffect, useRef } from 'react'
import { GALAXY_VERTEX_SHADER, GALAXY_FRAGMENT_SHADER } from '@/data/shaders'

interface GalaxyBackgroundProps {
  // 'fixed' for a persistent backdrop behind scrolling content (homepage),
  // 'absolute' when the parent is already its own fixed full-screen layer
  // (preloader) — avoids nesting two fixed contexts for no reason.
  position?: 'fixed' | 'absolute'
}

const COUNT = 1100

export default function GalaxyBackground({ position = 'fixed' }: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false }) as WebGL2RenderingContext | null
    if (!gl) return

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prg = gl.createProgram()!
    gl.attachShader(prg, mkShader(gl.VERTEX_SHADER,   GALAXY_VERTEX_SHADER))
    gl.attachShader(prg, mkShader(gl.FRAGMENT_SHADER, GALAXY_FRAGMENT_SHADER))
    gl.linkProgram(prg)
    gl.useProgram(prg)

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const positions  = new Float32Array(COUNT * 2)
    const sizes      = new Float32Array(COUNT)
    const phases     = new Float32Array(COUNT)
    const speeds     = new Float32Array(COUNT)
    const tints      = new Float32Array(COUNT)
    const depthSeeds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 2]     = rand(-1, 1)
      positions[i * 2 + 1] = rand(-1, 1)
      sizes[i]  = Math.random()
      phases[i] = rand(0, Math.PI * 2)
      speeds[i] = rand(0.3, 1.1)
      tints[i]  = i % 2 // exact 50/50 split before shuffling below
      depthSeeds[i] = Math.random() // staggers each star's approach-cycle loop
    }
    // Shuffle so silver/gold aren't laid out in an alternating pattern by index.
    for (let i = tints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = tints[i]; tints[i] = tints[j]; tints[j] = tmp
    }

    const mkBuf = (data: Float32Array, loc: number, size: number) => {
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    }
    mkBuf(positions,  0, 2)
    mkBuf(sizes,      1, 1)
    mkBuf(phases,     2, 1)
    mkBuf(speeds,     3, 1)
    mkBuf(tints,      4, 1)
    mkBuf(depthSeeds, 5, 1)

    const uTime = gl.getUniformLocation(prg, 'uTime')
    const uDpr  = gl.getUniformLocation(prg, 'uDpr')

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // additive — fragment output is already alpha-premultiplied

    const dpr = Math.min(window.devicePixelRatio, 2)
    gl.uniform1f(uDpr, dpr)

    const resize = () => {
      canvas.width  = Math.round(canvas.clientWidth  * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const renderFrame = (seconds: number) => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, seconds)
      gl.drawArrays(gl.POINTS, 0, COUNT)
    }

    let raf = 0
    const loop = (ts: number) => {
      renderFrame(ts * 0.001)
      raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduceMotion) {
        raf = requestAnimationFrame(loop)
      }
    }

    if (reduceMotion) {
      renderFrame(0) // single static frame — no continuous animation
    } else {
      raf = requestAnimationFrame(loop)
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position,
        inset: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
