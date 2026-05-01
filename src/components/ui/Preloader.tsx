import { useEffect, useRef, useState } from 'react'

interface PreloaderProps { onComplete: () => void }

const MIN_DURATION  = 5000
const ANIM_DURATION = 4000
const ASSEMBLE_DUR  = 2400  // how long the assembly effect runs

// Dissolve shader — same as before but we run u_t from 1→0 (reverse = assembly)
const VS = `
  attribute vec2 a;
  varying vec2 v;
  void main(){ v=a*0.5+0.5; gl_Position=vec4(a,0.0,1.0); }
`
const FS = `
  precision highp float;
  varying vec2 v;
  uniform sampler2D u_tex;
  uniform float u_t;
  uniform float u_ar;

  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }
  float fbm(vec2 p){
    float r=0.,a=.5;
    for(int i=0;i<5;i++){r+=a*noise(p);p*=2.1;a*=.5;}
    return r;
  }
  void main(){
    vec4 t=texture2D(u_tex,v);
    if(t.a<0.02) discard;
    float n=fbm(v*vec2(u_ar,1.0)*5.0);
    float band=0.14;
    if(n<u_t-band) discard;
    float fade=smoothstep(u_t,u_t-band,n);
    float edge=smoothstep(u_t-band,u_t-band*0.3,n)
              *smoothstep(u_t+0.01,u_t-band*0.4,n);
    gl_FragColor=vec4(t.rgb+vec3(0.8,0.9,1.0)*edge*0.9, t.a*fade);
  }
`

export default function Preloader({ onComplete }: PreloaderProps) {
  const [pct, setPct]           = useState(0)
  const [htmlVisible, setHtmlVisible] = useState(false)  // shows AFTER effect completes
  const [exiting, setExiting]   = useState(false)

  const glCanvasRef   = useRef<HTMLCanvasElement>(null)
  const dustCanvasRef = useRef<HTMLCanvasElement>(null)
  const htmlTextRef   = useRef<HTMLDivElement>(null)
  const minDone       = useRef(false)
  const exitTriggered = useRef(false)
  const rafRef        = useRef(0)

  const tryExit = () => {
    if (minDone.current && !exitTriggered.current) {
      exitTriggered.current = true
      setPct(100)
      setTimeout(() => { setExiting(true); setTimeout(onComplete, 900) }, 300)
    }
  }

  useEffect(() => {
    // Progress bar
    let rafPct: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const raw = Math.min((now - t0) / ANIM_DURATION, 1)
      setPct(Math.floor((1 - Math.pow(1-raw, 3)) * 100))
      if (raw < 1) rafPct = requestAnimationFrame(tick)
    }
    rafPct = requestAnimationFrame(tick)
    const tMin = setTimeout(() => { minDone.current = true; tryExit() }, MIN_DURATION)

    // Wait for fonts to load, then run the assembly effect
    Promise.all(
      ['Playfair Display', 'Manrope', 'Inter'].map(f =>
        document.fonts.load(`700 16px "${f}"`).catch(() => {})
      )
    ).then(() => {
      // Small delay so fonts are definitely applied to DOM
      setTimeout(() => runAssembly(), 300)
    })

    return () => {
      cancelAnimationFrame(rafPct)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(tMin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAssembly = () => {
    const glCanvas   = glCanvasRef.current
    const dustCanvas = dustCanvasRef.current
    const textEl     = htmlTextRef.current
    if (!glCanvas || !dustCanvas || !textEl) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    const W   = Math.round(window.innerWidth  * dpr)
    const H   = Math.round(window.innerHeight * dpr)
    glCanvas.width   = W; glCanvas.height   = H
    dustCanvas.width = W; dustCanvas.height = H

    // Draw text to offscreen canvas using exact DOM positions
    // htmlTextRef is rendered but invisible (opacity:0) — layout is still calculated
    const offscreen = document.createElement('canvas')
    offscreen.width = W; offscreen.height = H
    const octx = offscreen.getContext('2d')!

    Array.from(textEl.querySelectorAll('span')).forEach(span => {
      const rect = span.getBoundingClientRect()
      const st   = window.getComputedStyle(span)
      const fs   = parseFloat(st.fontSize) * dpr
      const ls   = parseFloat(st.letterSpacing) || 0
      octx.font          = `${st.fontWeight} ${fs}px ${st.fontFamily}`
      octx.fillStyle     = st.color
      octx.textAlign     = 'center'
      octx.textBaseline  = 'alphabetic'
      octx.letterSpacing = `${ls * dpr}px`
      octx.fillText(
        span.textContent || '',
        (rect.left + rect.width  / 2) * dpr,
        (rect.top  + rect.height * 0.80) * dpr
      )
    })
    octx.letterSpacing = '0px'

    // WebGL setup
    const gl = (
      glCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
      glCanvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false })
    ) as WebGLRenderingContext
    if (!gl) { setHtmlVisible(true); return }

    const mkS = (t: number, s: string) => {
      const sh = gl.createShader(t)!; gl.shaderSource(sh,s); gl.compileShader(sh); return sh
    }
    const prg = gl.createProgram()!
    gl.attachShader(prg, mkS(gl.VERTEX_SHADER, VS))
    gl.attachShader(prg, mkS(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prg); gl.useProgram(prg)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const aLoc = gl.getAttribLocation(prg, 'a')
    gl.enableVertexAttribArray(aLoc)
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)

    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(gl.getUniformLocation(prg, 'u_tex'), 0)
    gl.uniform1f(gl.getUniformLocation(prg, 'u_ar'),  W / H)
    gl.viewport(0, 0, W, H)
    const uT = gl.getUniformLocation(prg, 'u_t')

    interface Dust { x:number;y:number;vx:number;vy:number;life:number;max:number;sz:number }
    const dust: Dust[] = []
    const dctx  = dustCanvas.getContext('2d')!
    const tdata = octx.getImageData(0, 0, W, H).data
    const start = performance.now()

    const frame = (now: number) => {
      const raw  = Math.min((now - start) / ASSEMBLE_DUR, 1)
      const ease = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw+2,2)/2
      // REVERSED: start at 1 (fully dissolved/invisible), end at 0 (fully solid)
      const prog = 1 - ease

      // WebGL: renders text appearing from nothing
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uT, prog)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Dust particles that settle into the text as it forms
      if (prog > 0.02 && prog < 0.96) {
        for (let i = 0; i < 10; i++) {
          const x = Math.floor(Math.random() * W)
          const y = Math.floor(Math.random() * H)
          if (tdata[(y * W + x) * 4 + 3] < 30) continue
          const n = Math.abs(Math.sin(x*0.07+y*0.13)*0.5 + Math.cos(x*0.11-y*0.09)*0.5)
          if (Math.abs(n - prog) > 0.12) continue
          dust.push({
            x: x + (Math.random()-0.5)*60*dpr,
            y: y + (Math.random()-0.5)*30*dpr,
            vx: (Math.random()-0.5)*1.0,
            vy: -(Math.random()*1.5+0.3),  // float upward then settle
            life: 0, max: Math.random()*45+25,
            sz: Math.random()*1.8+0.4,
          })
        }
      }

      dctx.clearRect(0,0,W,H)
      for (let i = dust.length-1; i >= 0; i--) {
        const p = dust[i]; p.life++
        if (p.life > p.max) { dust.splice(i,1); continue }
        const t2 = p.life/p.max
        p.x += p.vx; p.y += p.vy; p.vy += 0.06
        dctx.globalAlpha = (1-t2)*0.8
        dctx.fillStyle   = '#fff'
        dctx.beginPath()
        dctx.arc(p.x/dpr, p.y/dpr, p.sz*(1-t2*0.5), 0, Math.PI*2)
        dctx.fill()
      }
      dctx.globalAlpha = 1

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Effect done — clear WebGL canvas, make HTML text visible
        // The HTML text was rendered invisibly (opacity:0) the whole time
        // Now reveal it — it sits exactly where the WebGL effect drew it
        gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
        dctx.clearRect(0,0,W,H)
        setHtmlVisible(true)  // fade in HTML text — seamless handoff
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  return (
    <div className={`
      fixed inset-0 z-50 bg-black flex flex-col items-center justify-center
      transition-opacity duration-700 ease-in-out
      ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}>

      {/* HTML text — invisible until assembly completes, then fades in */}
      {/* Rendered in DOM from the start so getBoundingClientRect() works */}
      <div
        ref={htmlTextRef}
        style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           8,
          zIndex:        1,
          position:      'relative',
          // Start invisible, snap visible when WebGL effect finishes
          // No transition delay — instant reveal matches last WebGL frame
          opacity:       htmlVisible ? 1 : 0,
          transition:    'opacity 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: 'clamp(64px, 10vw, 120px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1, letterSpacing: '0.02em',
          display: 'block',
        }}>Khan</span>

        <span style={{
          fontFamily: '"Manrope", sans-serif',
          fontSize: 'clamp(28px, 4.5vw, 56px)',
          fontWeight: 300, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1, letterSpacing: '0.14em',
          marginTop: 4, display: 'block',
        }}>TheUnseen</span>

        <span style={{
          fontFamily: '"Manrope", sans-serif',
          fontSize: 'clamp(11px, 1.3vw, 15px)',
          fontWeight: 300, color: 'rgba(255,255,255,0.32)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          marginTop: 16, display: 'block',
        }}>I innovate concepts that redefine industries.</span>
      </div>

      {/* WebGL assembly effect — on top of HTML, clears when done */}
      <canvas ref={glCanvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 2, pointerEvents: 'none',
      }}/>
      <canvas ref={dustCanvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 3, pointerEvents: 'none',
      }}/>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10, width: 240, zIndex: 4,
      }}>
        <div style={{
          width: '100%', height: 1,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden', borderRadius: 1,
        }}>
          <div style={{
            height: '100%', background: '#fff',
            width: `${pct}%`, transition: 'width 0.08s linear',
          }}/>
        </div>
        <span style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: 11, fontWeight: 500,
          letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.22)',
        }}>{String(pct).padStart(3,'0')}%</span>
      </div>
    </div>
  )
}