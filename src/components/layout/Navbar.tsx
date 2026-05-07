import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'

interface NavbarProps {
  autoOn: boolean
  onToggleAuto: () => void
  onPageTransition: (path: string) => void
}

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
    gl_FragColor=vec4(t.rgb+vec3(0.8,0.9,1.0)*edge*0.9,t.a*fade);
  }
`

const FONT_SIZE    = 'clamp(44px, 6vw, 76px)'
const FONT_FAMILY  = "'BastligaOne', serif"
const ASSEMBLE_DUR = 1800

function LogoAssemble() {
  const wrapRef       = useRef<HTMLDivElement>(null)
  const glCanvasRef   = useRef<HTMLCanvasElement>(null)
  const dustCanvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const wrap       = wrapRef.current
    const glCanvas   = glCanvasRef.current
    const dustCanvas = dustCanvasRef.current
    if (!wrap || !glCanvas || !dustCanvas) return

    let tid: ReturnType<typeof setTimeout>
    let raf1: number

    const scheduleStart = () => {
      raf1 = requestAnimationFrame(() => {
        raf1 = requestAnimationFrame(() => {
          tid = setTimeout(start, 50)
        })
      })
    }

    // On first load the app is hidden behind the preloader — wait for it to reveal.
    // On navigation (app already visible) start immediately.
    if ((window as { __appReady?: boolean }).__appReady) {
      scheduleStart()
    } else {
      window.addEventListener('app:ready', scheduleStart, { once: true })
    }

    function start() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const W   = Math.round(wrap!.offsetWidth  * dpr)
      const H   = Math.round(wrap!.offsetHeight * dpr)
      if (W === 0 || H === 0) { setDone(true); return }

      glCanvas.width   = W; glCanvas.height   = H
      dustCanvas.width = W; dustCanvas.height = H

      // Draw "Khan" in BastligaOne to offscreen canvas — same size as wrapper
      const off  = document.createElement('canvas')
      off.width  = W; off.height = H
      const octx = off.getContext('2d')!

      // Compute font size in px from CSS clamp
      const el   = wrap!.querySelector('span')!
      const st   = window.getComputedStyle(el)
      const fs   = parseFloat(st.fontSize) * dpr

      octx.font          = `normal ${fs}px "BastligaOne", serif`
      octx.fillStyle     = '#ffffff'
      octx.textAlign     = 'center'
      octx.textBaseline  = 'middle'
      octx.letterSpacing = `${0.06 * fs}px`
      octx.fillText('Khan', W / 2, H / 2)
      octx.letterSpacing = '0px'

      // WebGL
      const gl = (
        glCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
        glCanvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false })
      ) as WebGLRenderingContext
      if (!gl) { setDone(true); return }

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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.uniform1i(gl.getUniformLocation(prg, 'u_tex'), 0)
      gl.uniform1f(gl.getUniformLocation(prg, 'u_ar'), W / H)
      gl.viewport(0, 0, W, H)
      const uT = gl.getUniformLocation(prg, 'u_t')

      interface Dust { x:number;y:number;vx:number;vy:number;life:number;max:number;sz:number }
      const dust: Dust[] = []
      const dctx  = dustCanvas.getContext('2d')!
      const tdata = octx.getImageData(0, 0, W, H).data
      const t0    = performance.now()

      const frame = (now: number) => {
        const raw  = Math.min((now - t0) / ASSEMBLE_DUR, 1)
        const ease = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw+2,2)/2
        const prog = 1 - ease   // reversed: 1→0 = assemble from dust

        gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(uT, prog)
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        if (prog > 0.02 && prog < 0.96) {
          for (let i = 0; i < 6; i++) {
            const x = Math.floor(Math.random() * W)
            const y = Math.floor(Math.random() * H)
            if (tdata[(y*W+x)*4+3] < 30) continue
            const n = Math.abs(Math.sin(x*0.07+y*0.13)*0.5 + Math.cos(x*0.11-y*0.09)*0.5)
            if (Math.abs(n - prog) > 0.12) continue
            dust.push({
              x: x+(Math.random()-.5)*40*dpr, y: y+(Math.random()-.5)*15*dpr,
              vx:(Math.random()-.5)*0.7, vy:Math.random()*1+0.2,
              life:0, max:Math.random()*30+15, sz:Math.random()*1.2+0.3,
            })
          }
        }

        dctx.clearRect(0,0,W,H)
        for (let i = dust.length-1; i >= 0; i--) {
          const p = dust[i]; p.life++
          if (p.life > p.max) { dust.splice(i,1); continue }
          const t2 = p.life/p.max
          p.x += p.vx; p.y += p.vy; p.vy -= 0.02
          dctx.globalAlpha = (1-t2)*0.7
          dctx.fillStyle = '#fff'
          dctx.beginPath()
          dctx.arc(p.x/dpr, p.y/dpr, p.sz*(1-t2*0.5), 0, Math.PI*2)
          dctx.fill()
        }
        dctx.globalAlpha = 1

        if (raw < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
          dctx.clearRect(0,0,W,H)
          setDone(true)
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('app:ready', scheduleStart)
      clearTimeout(tid)
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    /* Wrapper — canvases sit absolutely inside, same size */
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* HTML span — always in layout, invisible during effect */}
      <span className="logo-glow" style={{
        fontFamily:    FONT_FAMILY,
        fontSize:      FONT_SIZE,
        letterSpacing: '0.06em',
        lineHeight:    1,
        userSelect:    'none',
        display:       'block',
        opacity:       done ? 1 : 0,
        transition:    done ? 'opacity 0.5s cubic-bezier(0.22,1,0.36,1)' : 'none',
      }}>Khan</span>

      {/* WebGL canvas — absolute, same size as wrapper */}
      <canvas ref={glCanvasRef} style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        display:       done ? 'none' : 'block',
      }}/>
      <canvas ref={dustCanvasRef} style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        display:       done ? 'none' : 'block',
      }}/>
    </div>
  )
}

export default function Navbar({ autoOn, onToggleAuto }: NavbarProps) {
  const { isMobile } = useBreakpoint()

  const toggleButton = (
    <button
      onClick={onToggleAuto}
      className="flex items-center gap-2 border border-white/12 rounded-full px-3.5 py-1.5 transition-colors duration-200"
      style={{ background: 'rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
    >
      <span className="relative inline-block rounded-full transition-colors duration-200"
        style={{ width:28, height:16, background: autoOn ? '#22c98a' : 'rgba(255,255,255,0.18)' }}>
        <span className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-200"
          style={{ width:12, height:12, left: autoOn ? 14 : 2 }}/>
      </span>
      <span style={{
        fontFamily:'Manrope,sans-serif', fontSize:10, fontWeight:500,
        letterSpacing:'0.08em', textTransform:'uppercase',
        color:'#fff',
      }}>{autoOn ? 'Auto' : 'Manual'}</span>
    </button>
  )

  if (isMobile) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-30 pointer-events-none fade-in" style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <LogoAssemble />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, pointerEvents: 'auto' }}>
          {toggleButton}
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-start justify-between px-12 py-7 fade-in">
      <div className="w-28" />
      <div className="flex-1 flex justify-center">
        <LogoAssemble />
      </div>
      <div className="w-28 flex justify-end" style={{ marginTop: 72 }}>
        {toggleButton}
      </div>
    </nav>
  )
}