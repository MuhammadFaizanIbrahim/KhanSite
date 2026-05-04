import { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'

const SVC  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || ''
const TMPL = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || ''
const CAL  = import.meta.env.VITE_CALENDLY_URL        || 'https://calendly.com/your-username/30min'

const CALENDLY_THEMED = `${CAL}?background_color=0a0a0a&text_color=ffffff&primary_color=aaaaaa&hide_gdpr_banner=1`

type Tab = 'message' | 'booking'

interface ContactOverlayProps {
  visible: boolean
  onClose: () => void
}

const inputSt: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 3, color: '#fff',
  fontFamily: "'Inter', sans-serif", fontSize: 13,
  outline: 'none', transition: 'border-color 0.2s',
}

const labelSt: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  fontSize: 9, fontWeight: 600,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.28)', marginBottom: 7,
}

export default function ContactOverlay({ visible, onClose }: ContactOverlayProps) {
  const [tab, setTab]     = useState<Tab>('message')
  const [form, setForm]   = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [mounted, setMounted] = useState(false)
  const formRef           = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      setStatus('idle')
      setTab('message')
      setForm({ name: '', email: '', phone: '', company: '', message: '' })
    } else {
      const t = setTimeout(() => setMounted(false), 600)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!mounted) return null

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current || status === 'sending') return
    setStatus('sending')
    try {
      await emailjs.sendForm(SVC, TMPL, formRef.current, KEY)
    } catch { /* fall through */ }
    setStatus('done')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: visible ? 'all' : 'none',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 41,
          maxHeight: '92vh', overflowY: 'auto',
          background: '#0a0a0a',
          borderTop: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '16px 16px 0 0',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
          padding: '40px 0 60px',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 28,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: "'Inter', sans-serif",
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
          Close
        </button>

        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 32px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.35)', lineHeight: 1.9, marginBottom: 10, letterSpacing: '0.04em' }}>
              Contact me · if · you are
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 700, color: '#fff', lineHeight: 1.55 }}>
              Building a product or business<br />
              in a new industry?<br />
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>I innovate the concepts that set you ahead.</span>
            </p>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
            {[
              {
                label: 'WhatsApp', href: 'https://wa.me/YOUR_NUMBER',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.858L.057 23.882a.5.5 0 0 0 .606.619l6.188-1.621A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.51-5.179-1.402l-.369-.22-3.823 1.002 1.019-3.72-.241-.383A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
              },
              {
                label: 'Email', href: 'mailto:hello@khan.com',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
              },
            ].map(btn => (
              <a
                key={btn.label} href={btn.href}
                target={btn.label === 'WhatsApp' ? '_blank' : undefined} rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 5, background: 'rgba(255,255,255,0.04)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)', textDecoration: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
              >
                {btn.icon}{btn.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', marginBottom: 28 }} />

          {/* Tab toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 50, padding: 4,
            }}>
              {(['message', 'booking'] as Tab[]).map(t => (
                <button
                  key={t} onClick={() => setTab(t)}
                  style={{
                    padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 9, fontWeight: tab === t ? 600 : 400,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: tab === t ? '#fff' : 'rgba(255,255,255,0.38)',
                    transition: 'background 0.25s, color 0.25s',
                  }}
                >
                  {t === 'message' ? 'Send a Message' : 'Book a Meeting'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Message tab ── */}
          {tab === 'message' && (
            status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#fff', marginBottom: 10 }}>Thank you.</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>I'll be in touch shortly.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Full Name',     name: 'from_name',  type: 'text',  ph: 'Full Name' },
                    { label: 'Email Address', name: 'from_email', type: 'email', ph: 'mail@company.com' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelSt}>{f.label}</label>
                      <input
                        name={f.name} type={f.type}
                        value={(form as any)[f.name === 'from_name' ? 'name' : 'email']}
                        onChange={handle} placeholder={f.ph} required
                        style={inputSt}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Phone Number', name: 'phone',   type: 'tel',  ph: 'Phone Number' },
                    { label: 'Company Name', name: 'company', type: 'text', ph: 'Company Name' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelSt}>{f.label}</label>
                      <input
                        name={f.name} type={f.type}
                        value={(form as any)[f.name]} onChange={handle}
                        placeholder={f.ph}
                        style={inputSt}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelSt}>More Information</label>
                  <textarea
                    name="message" value={form.message} onChange={handle}
                    placeholder="Tell me about your concept or project..."
                    rows={4}
                    style={{ ...inputSt, resize: 'vertical', minHeight: 100 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                <button
                  type="submit" disabled={status === 'sending'}
                  style={{
                    width: '100%', padding: '14px', border: 'none', borderRadius: 3,
                    background: status === 'sending' ? 'rgba(255,255,255,0.6)' : '#fff',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: '#000', cursor: status === 'sending' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {status === 'sending' ? 'Sending…' : (
                    <>
                      Submit
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 10L10 1M10 1H4M10 1v6"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )
          )}

          {/* ── Booking tab ── */}
          {tab === 'booking' && (
            <div>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11,
                color: 'rgba(255,255,255,0.3)', textAlign: 'center',
                letterSpacing: '0.06em', marginBottom: 16,
              }}>
                Pick a time that works for you — you'll receive a confirmation email automatically.
              </p>
              <div style={{
                borderRadius: 6,
                border: '0.5px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <iframe
                  src={CALENDLY_THEMED}
                  width="100%"
                  height="650"
                  title="Book an appointment"
                  style={{ display: 'block', minWidth: 280, border: 'none' }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
