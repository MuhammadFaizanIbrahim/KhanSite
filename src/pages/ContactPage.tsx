import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 10,
        background: '#000',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 32, left: 44, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Inter', sans-serif",
          fontSize: 10, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 6H3M5 4L3 6l2 2"/>
        </svg>
        Back
      </button>

      {/* Page content */}
      <div style={{
        minHeight: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: 620 }}>

          {/* ── Top text ── */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14, fontWeight: 300,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 2, marginBottom: 12,
            }}>
              Contact me<br />if<br />you are
            </p>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              fontWeight: 700, color: '#fff',
              lineHeight: 1.55,
            }}>
              Building a product or business in a new industry?<br />
              I innovate the concepts that set you<br />
              ahead of your industry.
            </p>
          </div>

          {/* ── WhatsApp + Email buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48 }}>
            {[
              {
                label: 'WhatsApp',
                href: 'https://wa.me/YOUR_NUMBER',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.65)">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.858L.057 23.882a.5.5 0 0 0 .606.619l6.188-1.621A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.51-5.179-1.402l-.369-.22-3.823 1.002 1.019-3.72-.241-.383A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                ),
              },
              {
                label: 'Email',
                href: 'mailto:hello@khan.com',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                ),
              },
            ].map(btn => (
              <a
                key={btn.label}
                href={btn.href}
                target={btn.label === 'WhatsApp' ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '12px 26px',
                  border: '0.5px solid rgba(255,255,255,0.18)',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.04)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'
                }}
              >
                {btn.icon}
                {btn.label}
              </a>
            ))}
          </div>

          {/* ── Form ── */}
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#fff', marginBottom: 12 }}>
                Thank you.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                I'll be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Full Name',     name: 'name',    type: 'text',  placeholder: 'Full Name' },
                  { label: 'Email Address', name: 'email',   type: 'email', placeholder: 'mail@company.com' },
                ].map(f => (
                  <div key={f.name}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                      {f.label}
                    </p>
                    <input
                      name={f.name} type={f.type}
                      value={(form as any)[f.name]} onChange={handle}
                      placeholder={f.placeholder}
                      required={f.name === 'name' || f.name === 'email'}
                      style={{
                        width: '100%', padding: '13px 16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, color: '#fff', outline: 'none',
                        fontFamily: "'Inter', sans-serif", fontSize: 13,
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                ))}
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Phone Number', name: 'phone',   type: 'tel',  placeholder: 'Phone Number' },
                  { label: 'Company Name', name: 'company', type: 'text', placeholder: 'Company Name' },
                ].map(f => (
                  <div key={f.name}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                      {f.label}
                    </p>
                    <input
                      name={f.name} type={f.type}
                      value={(form as any)[f.name]} onChange={handle}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '13px 16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, color: '#fff', outline: 'none',
                        fontFamily: "'Inter', sans-serif", fontSize: 13,
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                  More Information
                </p>
                <textarea
                  name="message" value={form.message} onChange={handle}
                  placeholder="Tell me about your concept or project..."
                  rows={5}
                  style={{
                    width: '100%', padding: '13px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, color: '#fff', outline: 'none',
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    resize: 'vertical', minHeight: 120,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%', padding: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}
              >
                Submit
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10L10 2M10 2H5M10 2v5"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}