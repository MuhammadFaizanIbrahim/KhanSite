import { useRef, useEffect, useCallback } from 'react'
import { VERTEX_SHADER, FRAGMENT_SHADER } from '@/data/shaders'
import { SECTIONS } from '@/data/sections'

export const MODE_SECTION = 0
export const MODE_PAGE    = 1

// Extract first frame from a video src by seeking to 0.1s
function extractFirstFrame(
  src: string,
  onFrame: (canvas: HTMLCanvasElement) => void
) {
  const v = document.createElement('video')
  v.crossOrigin = 'anonymous'
  v.muted       = true
  v.preload     = 'auto'
  v.playsInline = true

  const done = (c: HTMLCanvasElement | null) => {
    v.src = ''
    v.load()
    if (c) onFrame(c)
  }

  const grab = () => {
    if (v.videoWidth === 0) return
    try {
      const c = document.createElement('canvas')
      c.width  = Math.min(v.videoWidth,  1280)
      c.height = Math.min(v.videoHeight, 720)
      c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
      done(c)
    } catch { done(null) }
  }

  v.onseeked      = grab
  v.onerror       = () => done(null)

  // Seek to 0.1s once metadata is loaded
  v.onloadedmetadata = () => {
    v.currentTime = 0.1
  }

  // Timeout fallback — if video never loads
  const t = setTimeout(() => done(null), 5000)
  v.onseeked = () => { clearTimeout(t); grab() }
  v.onerror  = () => { clearTimeout(t); done(null) }

  v.src = src
}

export function useWebGL(curRef: React.RefObject<number>) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const glRef         = useRef<WebGLRenderingContext | null>(null)
  const texsRef       = useRef<(WebGLTexture | null)[]>(new Array(SECTIONS.length).fill(null))
  const fromTexRef    = useRef<WebGLTexture | null>(null)
  const toTexRef      = useRef<WebGLTexture | null>(null)
  const uA_           = useRef<WebGLUniformLocation | null>(null)
  const uB_           = useRef<WebGLUniformLocation | null>(null)
  const uP_           = useRef<WebGLUniformLocation | null>(null)
  const uT_           = useRef<WebGLUniformLocation | null>(null)
  const uAR_          = useRef<WebGLUniformLocation | null>(null)
  const uMode_        = useRef<WebGLUniformLocation | null>(null)
  const transPRef     = useRef(1)
  const transStartRef = useRef<number | null>(null)
  const transDurRef   = useRef(900)
  const transModeRef  = useRef(0)
  const glTimeRef     = useRef(0)
  const lastFRef      = useRef<number | null>(null)
  const rafRef        = useRef(0)
  const isTransRef    = useRef(false)

  const mkShader = useCallback((gl: WebGLRenderingContext, type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error('Shader:', gl.getShaderInfoLog(s))
    return s
  }, [])

  // Upload any image source as a WebGL texture
  const mkTex = useCallback((
    gl: WebGLRenderingContext,
    src: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): WebGLTexture => {
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return t
  }, [])

  // Called when a video frame is available — upgrades the texture for that section
  const captureVideoTexture = useCallback((idx: number, v: HTMLVideoElement | null) => {
    const gl = glRef.current
    if (!gl || !v) return
    if (v.videoWidth === 0 || v.readyState < 2) return
    try {
      // Draw video frame to offscreen canvas then upload
      const c = document.createElement('canvas')
      c.width  = Math.min(v.videoWidth,  1280)
      c.height = Math.min(v.videoHeight, 720)
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.drawImage(v, 0, 0, c.width, c.height)
      // Check it's not all black
      const d = ctx.getImageData(0, 0, 4, 4).data
      const sum = d[0] + d[1] + d[2] + d[4] + d[5] + d[6]
      if (sum < 10) return // frame is black, skip
      texsRef.current[idx] = mkTex(gl, c)
      // If currently idle on this section, update fromTex immediately
      if (idx === curRef.current && transPRef.current >= 1) {
        fromTexRef.current = texsRef.current[idx]
        toTexRef.current   = texsRef.current[idx]
      }
    } catch (e) {
      console.warn('captureVideoTexture failed', e)
    }
  }, [mkTex, curRef])

  const setSkipDraw      = useCallback((_: boolean) => {}, [])
  const setLiveVideo     = useCallback((_: HTMLVideoElement | null) => {}, [])
  const setIncomingVideo = useCallback((_: HTMLVideoElement | null) => {}, [])
  const snapshotVideoFrame = useCallback((_: HTMLVideoElement | null) => {}, [])

  const triggerTransition = useCallback((toIdx: number, mode: number) => {
    const fromIdx = curRef.current ?? 0
    fromTexRef.current    = texsRef.current[fromIdx] ?? texsRef.current[0]!
    toTexRef.current      = texsRef.current[toIdx]   ?? texsRef.current[0]!
    isTransRef.current    = true
    transPRef.current     = 0
    transStartRef.current = performance.now()
    transModeRef.current  = mode
    transDurRef.current   = mode === MODE_PAGE ? 650 : 900
  }, [curRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cvs = canvas

    const gl = (
      cvs.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
      cvs.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false })
    ) as WebGLRenderingContext
    if (!gl) return
    glRef.current = gl

    const vs  = mkShader(gl, gl.VERTEX_SHADER,   VERTEX_SHADER)
    const fs  = mkShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    const prg = gl.createProgram()!
    gl.attachShader(prg, vs); gl.attachShader(prg, fs)
    gl.linkProgram(prg); gl.useProgram(prg)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const aLoc = gl.getAttribLocation(prg, 'a')
    gl.enableVertexAttribArray(aLoc)
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)

    uA_.current    = gl.getUniformLocation(prg, 'uA')
    uB_.current    = gl.getUniformLocation(prg, 'uB')
    uP_.current    = gl.getUniformLocation(prg, 'uP')
    uT_.current    = gl.getUniformLocation(prg, 'uT')
    uAR_.current   = gl.getUniformLocation(prg, 'uAR')
    uMode_.current = gl.getUniformLocation(prg, 'uMode')

    // Extract first frame from each section's video as the WebGL texture
    // This gives us real video content for the dissolve effect
    let firstLoaded = false

    const tryStart = () => {
      if (!firstLoaded && texsRef.current[0]) {
        firstLoaded = true
        fromTexRef.current = texsRef.current[0]!
        toTexRef.current   = texsRef.current[0]!
        if (!rafRef.current) rafRef.current = requestAnimationFrame(loop)
      }
    }

    SECTIONS.forEach((sec, i) => {
      if (!sec.isVideo || !sec.videoSrc) {
        // Non-video section — use a dark gradient canvas
        const c = document.createElement('canvas')
        c.width = 4; c.height = 4
        const ctx = c.getContext('2d')!
        const cols = ['#0a0f1e','#060d0a','#1a0a04','#06081a','#120614','#060e12','#040408']
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(0, 0, 4, 4)
        texsRef.current[i] = mkTex(gl, c)
        tryStart()
        return
      }

      extractFirstFrame(sec.videoSrc, (canvas) => {
        texsRef.current[i] = mkTex(gl, canvas)
        // If currently on this section and idle, update textures
        if (i === curRef.current && transPRef.current >= 1) {
          fromTexRef.current = texsRef.current[i]!
          toTexRef.current   = texsRef.current[i]!
        }
        tryStart()
      })
    })

    function loop(ts: number) {
      if (!lastFRef.current) lastFRef.current = ts
      glTimeRef.current += (ts - lastFRef.current) * 0.001
      lastFRef.current = ts

      if (isTransRef.current && transStartRef.current !== null) {
        const raw = Math.min((ts - transStartRef.current) / transDurRef.current, 1)
        if (transModeRef.current === MODE_PAGE) {
          const t = raw
          transPRef.current = t < 0.3
            ? (t/0.3)*(t/0.3)*0.3
            : 0.3+((t-0.3)/0.7)*((t-0.3)/0.7)*(2.8-((t-0.3)/0.7)*1.1)*0.7
        } else {
          transPRef.current = raw
        }
        transPRef.current = Math.min(transPRef.current, 1)
        if (transPRef.current >= 1) {
          isTransRef.current = false
          fromTexRef.current = toTexRef.current
        }
      }

      // Resize
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = Math.round(cvs.clientWidth  * dpr)
      const h = Math.round(cvs.clientHeight * dpr)
      if (cvs.width !== w || cvs.height !== h) {
        cvs.width = w; cvs.height = h
        gl.viewport(0, 0, w, h)
      }

      const isTrans = transPRef.current < 1

      // Idle: transparent — video plays underneath
      if (!isTrans) {
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Transition: draw organic dissolve
      const ar = (cvs.width || 1) / (cvs.height || 1)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fromTexRef.current)
      gl.uniform1i(uA_.current, 0)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, toTexRef.current)
      gl.uniform1i(uB_.current, 1)

      gl.uniform1f(uP_.current,    transPRef.current)
      gl.uniform1f(uT_.current,    glTimeRef.current)
      gl.uniform1f(uAR_.current,   ar)
      gl.uniform1f(uMode_.current, transModeRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      rafRef.current = requestAnimationFrame(loop)
    }

    return () => { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
  }, [mkShader, mkTex])

  return {
    canvasRef, triggerTransition,
    setSkipDraw, snapshotVideoFrame,
    setLiveVideo, setIncomingVideo,
    captureVideoTexture,
  }
}