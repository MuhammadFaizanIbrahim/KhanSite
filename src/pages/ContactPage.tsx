import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import Footer from '@/components/sections/Footer'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SVC  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || ''
const TMPL = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY   || ''

const GOLD = '#D4AF37'
const ICON_STROKE = 1.6

const fieldSt = (isMobile: boolean): React.CSSProperties => ({
  width: '100%',
  padding: isMobile ? '13px 42px 13px 15px' : '14px 44px 14px 17px',
  background: 'rgba(10,10,13,0.55)',
  border: '1px solid rgba(212,175,55,0.35)',
  borderRadius: 8, color: '#fff', outline: 'none',
  fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 13.5,
  transition: 'border-color 0.2s',
})

const labelSt: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5, fontWeight: 600,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.85)', marginBottom: 8,
  display: 'block',
}

function SparkleIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={GOLD}>
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z" />
    </svg>
  )
}

const ERROR_COLOR = '#e0483e'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ErrorText({ show, text }: { show?: boolean; text: string }) {
  // Always rendered (space reserved via visibility, not display) so a field
  // going invalid never grows the form and shifts everything below it.
  return (
    <div style={{
      marginTop: 6, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: ERROR_COLOR,
      visibility: show ? 'visible' : 'hidden',
    }}>
      {text}
    </div>
  )
}

const CheckIcon = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
)

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
      {children}
    </div>
  )
}

const BuildingIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="10" height="18" rx="1" /><rect x="14" y="8" width="6" height="13" rx="1" />
    <path d="M7 7h1M7 11h1M7 15h1M11 7h1M11 11h1M11 15h1M16.5 12h1M16.5 16h1" />
  </svg>
)
const EnvelopeIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" />
  </svg>
)
const CalendarIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)
const ClockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
  </svg>
)
const PencilIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)
const BackArrowIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)
const ArrowIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const WhatsAppIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={GOLD}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.858L.057 23.882a.5.5 0 0 0 .606.619l6.188-1.621A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.51-5.179-1.402l-.369-.22-3.823 1.002 1.019-3.72-.241-.383A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
)

export default function ContactPage() {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile, isTablet } = useBreakpoint()
  const stacked = isTablet
  const content = useContent('contact-page')

  const [form, setForm] = useState({ company: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)

  const clearError = (field: string) => setErrors(p => (p[field] ? { ...p, [field]: false } : p))

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    clearError(e.target.name)
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const next: Record<string, boolean> = {
      company: !form.company.trim(),
      from_email: !EMAIL_RE.test(form.email.trim()),
      date: !selectedDate,
      time: !selectedTime,
      message: !form.message.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!validate() || !formRef.current) return
    setStatus('sending')
    try { await emailjs.sendForm(SVC, TMPL, formRef.current, KEY) } catch { /* fall through */ }
    setStatus('done')
  }

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    ...fieldSt(isMobile),
    borderColor: hasError ? ERROR_COLOR : 'rgba(212,175,55,0.35)',
  })
  const onFieldFocus = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hasError) e.target.style.borderColor = 'rgba(212,175,55,0.8)'
  }
  const onFieldBlur = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = hasError ? ERROR_COLOR : 'rgba(212,175,55,0.35)'
  }

  const bg = isMobile ? "url('/images/contact%20bg%20mobile.png')" : "url('/images/contact%20bg%20desktop.png')"

  const HeadingBlock = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: isMobile ? 12 : 16 }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 13, fontWeight: 600,
          letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase',
        }}>{content.eyebrow}</span>
        <div style={{ width: isMobile ? 60 : 90, height: 1, background: 'rgba(212,175,55,0.5)' }} />
        <SparkleIcon size={12} />
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        fontSize: isMobile ? 'clamp(24px, 8vw, 32px)' : 'clamp(30px, 3vw, 42px)',
        lineHeight: 1.15, margin: 0,
      }}>
        <div style={{ color: '#F2F2F2' }}>{content.headingWhite}</div>
        <div style={{ color: GOLD }}>{content.headingGold}</div>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: isMobile ? '16px 0 20px' : '22px 0 26px' }}>
        <div style={{ width: isMobile ? 70 : 110, height: 1, background: 'linear-gradient(to right, rgba(212,175,55,0.7), transparent)' }} />
        <SparkleIcon size={9} />
        <div style={{ width: isMobile ? 70 : 110, height: 1, background: 'linear-gradient(to left, rgba(212,175,55,0.7), transparent)' }} />
      </div>

      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13.5 : 14.5, lineHeight: 1.65,
        color: 'rgba(255,255,255,0.82)', margin: content.paragraph2 ? '0 0 16px' : 0, maxWidth: 440,
      }}>{content.paragraph1}</p>
      {content.paragraph2 && (
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13.5 : 14.5, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.82)', margin: 0, maxWidth: 440,
        }}>{content.paragraph2}</p>
      )}
    </div>
  )

  const AltMethodsBlock = (
    <div style={{ marginTop: isMobile ? 36 : 52 }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD,
      }}>{content.altMethodsLabel}</span>
      <div style={{ width: 70, height: 1, background: 'rgba(212,175,55,0.5)', margin: '12px 0 18px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { key: 'whatsapp', icon: WhatsAppIcon, ...content.whatsapp, external: true },
          { key: 'email', icon: EnvelopeIcon, ...content.email, external: false },
        ].map(m => (
          <a
            key={m.key}
            href={m.href}
            target={m.external ? '_blank' : undefined}
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: isMobile ? '14px 16px' : '16px 22px',
              border: '1px solid rgba(212,175,55,0.35)', borderRadius: 12,
              background: 'rgba(10,10,13,0.45)', textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.08)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,13,0.45)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle, rgba(212,175,55,0.22), rgba(212,175,55,0.04))',
                border: '1px solid rgba(212,175,55,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{m.icon}</div>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff',
                }}>{m.label}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  {m.description}
                </div>
              </div>
            </div>
            {ArrowIcon}
          </a>
        ))}
      </div>
    </div>
  )

  const FormBlock = (
    <div style={{
      border: '1px solid rgba(212,175,55,0.4)', borderRadius: 16,
      background: 'rgba(6,6,8,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      padding: isMobile ? '26px 20px' : '38px 42px',
      marginTop: stacked ? 36 : 0,
      // Fixed so the card doesn't grow/shrink switching between the form,
      // validation errors, and the success state — they all render inside it.
      minHeight: isMobile ? undefined : 640,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14.5, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD,
        }}>{content.form.eyebrow}</span>
        <SparkleIcon size={13} />
      </div>
      <div style={{ width: 50, height: 1, background: 'rgba(212,175,55,0.6)', margin: isMobile ? '18px 0 22px' : '20px 0 28px' }} />

      {status === 'done' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%', marginBottom: 26,
            border: `1.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 26px 4px rgba(212,175,55,0.35)',
          }}>{CheckIcon}</div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 14.5 : 16.5, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px', lineHeight: 1.4,
          }}>{content.form.successTitle}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {content.form.successMessage}
          </p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 18 : 22 }}>
            <div>
              <label style={labelSt}>{content.form.companyLabel}</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="company" value={form.company} onChange={handle}
                  placeholder={content.form.companyPlaceholder}
                  style={fieldStyle(errors.company)}
                  onFocus={onFieldFocus(errors.company)}
                  onBlur={onFieldBlur(errors.company)}
                />
                <FieldIcon>{BuildingIcon}</FieldIcon>
              </div>
              <ErrorText show={errors.company} text={content.form.requiredError} />
            </div>
            <div>
              <label style={labelSt}>{content.form.emailLabel}</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="from_email" type="email" value={form.email}
                  onChange={e => { clearError('from_email'); setForm(p => ({ ...p, email: e.target.value })) }}
                  placeholder={content.form.emailPlaceholder}
                  style={fieldStyle(errors.from_email)}
                  onFocus={onFieldFocus(errors.from_email)}
                  onBlur={onFieldBlur(errors.from_email)}
                />
                <FieldIcon>{EnvelopeIcon}</FieldIcon>
              </div>
              <ErrorText
                show={errors.from_email}
                text={form.email.trim() ? content.form.invalidEmailError : content.form.requiredError}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 18 : 22 }}>
            <div>
              <label style={labelSt}>{content.form.dateLabel}</label>
              <div style={{ position: 'relative' }}>
                <DatePicker
                  wrapperClassName="datepicker-full-width"
                  selected={selectedDate}
                  onChange={(date: Date | null) => { clearError('date'); setSelectedDate(date) }}
                  dateFormat="MM/dd/yyyy"
                  minDate={new Date()}
                  placeholderText={content.form.datePlaceholder}
                  customInput={<input style={fieldStyle(errors.date)} />}
                />
                <FieldIcon>{CalendarIcon}</FieldIcon>
              </div>
              <ErrorText show={errors.date} text={content.form.requiredError} />
            </div>
            <div>
              <label style={labelSt}>{content.form.timeLabel}</label>
              <div style={{ position: 'relative' }}>
                <DatePicker
                  wrapperClassName="datepicker-full-width"
                  selected={selectedTime}
                  onChange={(time: Date | null) => { clearError('time'); setSelectedTime(time) }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText={content.form.timePlaceholder}
                  customInput={<input style={fieldStyle(errors.time)} />}
                />
                <FieldIcon>{ClockIcon}</FieldIcon>
              </div>
              <ErrorText show={errors.time} text={content.form.requiredError} />
            </div>
          </div>

          <div>
            <label style={labelSt}>{content.form.detailsLabel}</label>
            <div style={{ position: 'relative' }}>
              <textarea
                name="message" value={form.message} onChange={handle}
                placeholder={content.form.detailsPlaceholder}
                rows={isMobile ? 5 : 5}
                style={{ ...fieldStyle(errors.message), resize: 'vertical', minHeight: isMobile ? 130 : 150, lineHeight: 1.6 }}
                onFocus={onFieldFocus(errors.message)}
                onBlur={onFieldBlur(errors.message)}
              />
              <div style={{ position: 'absolute', right: 14, bottom: 14 }}>{PencilIcon}</div>
            </div>
            <ErrorText show={errors.message} text={content.form.requiredError} />
          </div>

          <button
            type="submit" disabled={status === 'sending'}
            data-cursor={status === 'sending' ? 'loading' : undefined}
            style={{
              width: '100%', padding: isMobile ? '16px' : '16px',
              background: status === 'sending'
                ? 'rgba(212,175,55,0.5)'
                : 'linear-gradient(90deg, #B8860B, #D4AF37 45%, #F0CB63 75%, #D4AF37)',
              border: 'none', borderRadius: 8,
              cursor: status === 'sending' ? 'default' : 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 13, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1206',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {status === 'sending' ? 'Sending…' : (
              <>
                {content.form.submitLabel}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1206" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      background: '#000',
      backgroundImage: bg,
      backgroundSize: 'cover',
      backgroundPosition: isMobile ? 'top center' : 'center',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => triggerPageOut(() => navigate('/'))}
        aria-label="Back"
        style={{
          position: 'fixed', top: isMobile ? 18 : 28, left: isMobile ? 18 : 36, zIndex: 20,
          width: 44, height: 44, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.4)',
          background: 'rgba(10,10,13,0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {BackArrowIcon}
      </button>

      <div ref={scrollRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <div style={{
          maxWidth: stacked ? 640 : 1500, margin: '0 auto',
          padding: isMobile ? '92px 20px 60px' : stacked ? '110px 40px 70px' : '130px 60px 100px',
          display: stacked ? 'block' : 'flex',
          gap: stacked ? 0 : 100,
          alignItems: 'flex-start',
        }}>
          {stacked ? (
            <>
              {HeadingBlock}
              {FormBlock}
              {AltMethodsBlock}
            </>
          ) : (
            <>
              <div style={{ flex: '0 0 460px' }}>
                {HeadingBlock}
                {AltMethodsBlock}
              </div>
              <div style={{ flex: 1 }}>{FormBlock}</div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}
