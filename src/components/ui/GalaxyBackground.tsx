import { useEffect, useRef } from 'react'
import { GALAXY_VERTEX_SHADER, GALAXY_FRAGMENT_SHADER } from '@/data/shaders'

interface GalaxyBackgroundProps {
  // 'fixed' for a persistent backdrop behind scrolling content (homepage),
  // 'absolute' when the parent is already its own fixed full-screen layer
  // (preloader) — avoids nesting two fixed contexts for no reason.
  position?: 'fixed' | 'absolute'
  // How fast the hyperspace flythrough feels — depth units traveled per
  // second. Raise for a faster warp, lower for a slower drift.
  speed?: number
}

const COUNT = 600

export default function GalaxyBackground({ position = 'fixed', speed = 0.16 }: GalaxyBackgroundProps) {
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

    // Shared unit "stick" quad — local x is across-width, local y 0→1 is tail→head.
    const cornerBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, 0, 0.5, 0, -0.5, 1, 0.5, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const indices    = new Float32Array(COUNT)
    const depthSeeds = new Float32Array(COUNT)
    const sizes      = new Float32Array(COUNT)
    const tints      = new Float32Array(COUNT)
    const phases     = new Float32Array(COUNT)
    const speeds     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      indices[i]     = i
      depthSeeds[i]  = Math.random() // staggers each star's far-to-close loop
      sizes[i]       = Math.random()
      tints[i]       = i % 2 // exact 50/50 split before shuffling below
      phases[i]      = rand(0, Math.PI * 2)
      speeds[i]      = rand(0.3, 1.1)
    }
    // Shuffle so silver/gold aren't laid out in an alternating pattern by index.
    for (let i = tints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = tints[i]; tints[i] = tints[j]; tints[j] = tmp
    }

    const mkInstancedBuf = (data: Float32Array, loc: number, size: number) => {
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(loc, 1)
    }
    mkInstancedBuf(indices,     1, 1)
    mkInstancedBuf(depthSeeds,  2, 1)
    mkInstancedBuf(sizes,       3, 1)
    mkInstancedBuf(tints,       4, 1)
    mkInstancedBuf(phases,      5, 1)
    mkInstancedBuf(speeds,      6, 1)

    const uTime      = gl.getUniformLocation(prg, 'uTime')
    const uWarpSpeed = gl.getUniformLocation(prg, 'uWarpSpeed')

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // additive — fragment output is already alpha-premultiplied
    gl.uniform1f(uWarpSpeed, speed)

    const dpr = Math.min(window.devicePixelRatio, 2)

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
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, COUNT)
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
  }, [speed])

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
