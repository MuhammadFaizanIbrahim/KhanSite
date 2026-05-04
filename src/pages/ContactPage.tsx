import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { usePageTransition } from '@/contexts/TransitionContext'

const SVC  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || ''
const TMPL = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || ''
const CAL  = import.meta.env.VITE_CALENDLY_URL        || ''

const isCalConfigured = CAL && !CAL.includes('your-username')
const CALENDLY_URL    = isCalConfigured
  ? `${CAL}?background_color=040609&text_color=ffffff&primary_color=999999&hide_gdpr_banner=1`
  : ''

type Tab = 'message' | 'booking'

const fieldSt: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.03)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 4, color: '#fff', outline: 'none',
  fontFamily: "'Inter', sans-serif", fontSize: 13,
  transition: 'border-color 0.2s',
}

const labelSt: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9, fontWeight: 600,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.28)', marginBottom: 6,
  display: 'block',
}

export default function ContactPage() {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const [tab, setTab]       = useState<Tab>('message')
  const [form, setForm]     = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const formRef             = useRef<HTMLFormElement>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current || status === 'sending') return
    setStatus('sending')
    try { await emailjs.sendForm(SVC, TMPL, formRef.current, KEY) } catch { /* fall through */ }
    setStatus('done')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Back button ── */}
      <button
        onClick={() => triggerPageOut(() => navigate('/'))}
        style={{
          position: 'fixed', top: 28, left: 36, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: "'Inter', sans-serif",
          fontSize: 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2"/>
        </svg>
        Back
      </button>

      {/* ══════════════════════════════════════════
          TOP — 35vh — title + tagline + links
      ══════════════════════════════════════════ */}
      <div style={{
        height: '40vh',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '48px 48px 28px',
        flexShrink: 0,
      }}>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(24px, 3.2vw, 44px)',
          fontWeight: 300,
          color: '#fff',
          letterSpacing: '0.04em',
          lineHeight: 1.1,
          margin: '0 0 30px',
        }}>
          Contact{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.55)' }}>Us</em>
        </h1>

        {/* Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10, fontWeight: 300,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            margin: 0,
          }}>
            if · you · are
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(12px, 1.1vw, 15px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            margin: 0,
          }}>
            Building a product or business in a new industry?
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(12px, 1.1vw, 15px)',
            fontStyle: 'italic', fontWeight: 400,
            color: 'rgba(255,255,255,0.38)',
            margin: 0,
          }}>
            I innovate the concepts that set you ahead.
          </p>
        </div>

        {/* Quick links — horizontal */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            {
              label: 'WhatsApp', href: 'https://wa.me/YOUR_NUMBER',
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.858L.057 23.882a.5.5 0 0 0 .606.619l6.188-1.621A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.51-5.179-1.402l-.369-.22-3.823 1.002 1.019-3.72-.241-.383A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
            },
            {
              label: 'Email', href: 'mailto:hello@khan.com',
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
            },
          ].map(btn => (
            <a
              key={btn.label} href={btn.href}
              target={btn.label === 'WhatsApp' ? '_blank' : undefined} rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 16px',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 50, background: 'rgba(255,255,255,0.03)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 10, fontWeight: 400,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background   = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
                ;(e.currentTarget as HTMLElement).style.color       = '#fff'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background   = 'rgba(255,255,255,0.03)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                ;(e.currentTarget as HTMLElement).style.color       = 'rgba(255,255,255,0.5)'
              }}
            >
              {btn.icon}{btn.label}
            </a>
          ))}
        </div>
      </div>

      {/* Horizontal divider */}
      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      {/* ══════════════════════════════════════════
          BOTTOM — 65vh — tabs + form / calendar
      ══════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Tab bar */}
        <div style={{
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          padding: '16px 0',
          display: 'flex', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'inline-flex',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 50, padding: 3,
          }}>
            {(['message', 'booking'] as Tab[]).map(t => (
              <button
                key={t} onClick={() => setTab(t)}
                style={{
                  padding: '7px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9, fontWeight: tab === t ? 600 : 400,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                  transition: 'background 0.22s, color 0.22s',
                }}
              >
                {t === 'message' ? 'Send a Message' : 'Book a Meeting'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Message tab ── */}
        {tab === 'message' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0 40px' }}>
            <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 32px' }}>
              {status === 'done' ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 10 }}>Thank you.</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>I'll be in touch shortly.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                          style={fieldSt}
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
                          style={fieldSt}
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
                      style={{ ...fieldSt, resize: 'vertical', minHeight: 100 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  <button
                    type="submit" disabled={status === 'sending'}
                    style={{
                      width: '100%', padding: '13px',
                      background: status === 'sending' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)',
                      border: 'none', borderRadius: 4,
                      cursor: status === 'sending' ? 'default' : 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = '#fff' }}
                    onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = 'rgba(255,255,255,0.9)' }}
                  >
                    {status === 'sending' ? 'Sending…' : (
                      <>
                        Submit
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 10L10 2M10 2H5M10 2v5"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── Booking tab ── */}
        {tab === 'booking' && (
          isCalConfigured ? (
            <iframe
              src={CALENDLY_URL}
              width="100%"
              height="100%"
              title="Book an appointment"
              style={{ display: 'block', border: 'none', flex: 1 }}
            />
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '32px',
            }}>
              <div style={{
                maxWidth: 420, textAlign: 'center',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '36px 32px',
              }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', marginBottom: 10 }}>
                  Set up your Calendly link
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12,
                  color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: 20,
                }}>
                  Create a free account at <strong style={{ color: 'rgba(255,255,255,0.6)' }}>calendly.com</strong>,
                  set up a meeting type, then add your booking URL to{' '}
                  <code style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>.env.local</code>:
                </p>
                <code style={{
                  display: 'block', fontFamily: 'monospace', fontSize: 11,
                  color: 'rgba(255,255,255,0.45)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 4, padding: '10px 14px',
                  textAlign: 'left', lineHeight: 1.9,
                }}>
                  VITE_CALENDLY_URL=https://calendly.com/yourname/30min
                </code>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  )
}
