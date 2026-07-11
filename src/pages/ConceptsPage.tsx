import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '@/contexts/TransitionContext'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useLenis } from '@/hooks/useLenis'
import { useContent } from '@/hooks/useContent'
import { RichText } from '@/utils/richText'
import { slugify } from '@/utils/slug'
import StarDivider from '@/components/ui/StarDivider'
import Footer from '@/components/sections/Footer'
import type { Concept, ConceptSpace, ConceptType } from '@/data/concepts'
import {
  MdOutlineAutoAwesome, MdTrendingUp, MdOutlineSearch, MdRefresh,
  MdKeyboardArrowDown, MdOutlineTune, MdArrowForward, MdArrowBack, MdChevronRight, MdCheck,
} from 'react-icons/md'

const GOLD = '#D4AF37'
const PAGE_SIZE = 8

const SparkleIcon = <MdOutlineAutoAwesome size={13} color={GOLD} />
const TrendIcon = <MdTrendingUp size={12} color={GOLD} />
const SearchIcon = <MdOutlineSearch size={16} color="rgba(255,255,255,0.5)" />
const RefreshIcon = <MdRefresh size={13} color={GOLD} />
const ChevronIcon = ({ open }: { open: boolean }) => (
  <div style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
    <MdKeyboardArrowDown size={15} color={GOLD} />
  </div>
)
const SlidersIcon = <MdOutlineTune size={15} color={GOLD} />

function RadioRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        width: '100%', padding: '5px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          border: `1.5px solid ${active ? GOLD : 'rgba(255,255,255,0.3)'}`,
          background: active ? GOLD : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A0A0D' }} />}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12.5,
          color: active ? '#F2F2F2' : 'rgba(255,255,255,0.65)',
        }}>{label}</span>
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{count}</span>
    </button>
  )
}

function CheckRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        width: '100%', padding: '5px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{
          width: 15, height: 15, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${active ? GOLD : 'rgba(255,255,255,0.3)'}`,
          background: active ? GOLD : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {active && <MdCheck size={11} color="#0A0A0D" />}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12.5,
          color: active ? '#F2F2F2' : 'rgba(255,255,255,0.65)',
        }}>{label}</span>
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{count}</span>
    </button>
  )
}

function FilterGroup({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', padding: '16px 0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? 12 : 0,
        }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD,
        }}>{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && children}
    </div>
  )
}

function ConceptCard({ concept, isMobile, delay, inView, onOpen }: { concept: Concept; isMobile: boolean; delay: number; inView: boolean; onOpen: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)

  const image = imgFailed ? (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.14) 0%, rgba(10,10,13,0.9) 70%)',
    }} />
  ) : (
    <img
      src={concept.image} alt={concept.title} loading="lazy"
      onError={() => setImgFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )

  const badge = (
    <div style={{
      position: 'absolute', top: 10, right: 10,
      display: 'flex', alignItems: 'center', gap: 5,
      background: 'rgba(6,6,8,0.78)', backdropFilter: 'blur(6px)',
      border: '1px solid rgba(212,175,55,0.5)',
      borderRadius: 20, padding: '4px 10px',
    }}>
      {concept.status === 'new' ? SparkleIcon : TrendIcon}
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
        color: GOLD, whiteSpace: 'nowrap',
      }}>{concept.status === 'new' ? 'NEW' : 'IMPROVED'}</span>
    </div>
  )

  const content = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '10px 4px' : '14px 16px 16px' }}>
      <h3 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: 1.3,
        fontSize: isMobile ? 15 : 'clamp(15px, 1.3vw, 18px)', color: '#F2F2F2', margin: '0 0 8px',
        minHeight: '2.6em',
      }}>{concept.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, lineHeight: 1.4, color: 'rgba(237,237,237,0.75)', minHeight: '1.4em' }}>
          {concept.space.replace(' Concepts', '')}
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, lineHeight: 1.4, color: 'rgba(237,237,237,0.75)', minHeight: '1.4em' }}>
          {concept.tagline}
        </span>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onOpen() }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto',
          paddingTop: 12, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: GOLD }}>Explore Concept</span>
        <MdArrowForward size={13} color={GOLD} />
      </button>
    </div>
  )

  const wrapperStyle: React.CSSProperties = {
    border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, overflow: 'hidden',
    background: 'rgba(10,10,13,0.6)',
    cursor: 'pointer',
    height: '100%', display: 'flex', flexDirection: 'column',
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 1.3s ease ${delay}ms, transform 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  }

  if (isMobile) {
    return (
      <div data-cursor="select" onClick={onOpen} style={{ ...wrapperStyle, flexDirection: 'row', alignItems: 'stretch' }}>
        <div style={{ position: 'relative', width: '38%', flexShrink: 0, height: 140 }}>{image}{badge}</div>
        {content}
      </div>
    )
  }

  return (
    <div data-cursor="select" onClick={onOpen} style={wrapperStyle}>
      <div style={{ position: 'relative', flexShrink: 0, height: 'clamp(150px, 14vw, 200px)' }}>{image}{badge}</div>
      {content}
    </div>
  )
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

export default function ConceptsPage() {
  const navigate = useNavigate()
  const { triggerPageOut } = usePageTransition()
  const { isMobile } = useBreakpoint()
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)
  const pageContent = useContent('concepts-page')
  const CONCEPTS = pageContent.items as Concept[]
  const CONCEPT_SPACES = pageContent.spaces as readonly ConceptSpace[]
  const CONCEPT_TYPES = pageContent.types as readonly ConceptType[]

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'new' | 'improved'>('all')
  const [space, setSpace] = useState<'all' | ConceptSpace>('all')
  const [types, setTypes] = useState<Set<ConceptType>>(new Set())
  const [typeSearch, setTypeSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)

  const [gridRef, gridInView] = useInView<HTMLDivElement>()

  // Lenis caches the scrollable content height at init; this page's height
  // changes after mount (load-more reveals more cards, the mobile filter
  // panel expands/collapses), so without telling it to remeasure, scrolling
  // gets capped short of the real bottom (the footer becomes unreachable).
  useEffect(() => {
    const id = requestAnimationFrame(() => window.__lenis?.resize())
    return () => cancelAnimationFrame(id)
  }, [visibleCount, filtersOpen])

  const togglePillType = (t: ConceptType | 'all') => {
    setVisibleCount(PAGE_SIZE)
    if (t === 'all') { setTypes(new Set()); return }
    setTypes(prev => (prev.size === 1 && prev.has(t) ? new Set() : new Set([t])))
  }
  const toggleCheckType = (t: ConceptType) => {
    setVisibleCount(PAGE_SIZE)
    setTypes(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t); else next.add(t)
      return next
    })
  }

  const filtered = useMemo(() => CONCEPTS.filter(c => {
    if (status !== 'all' && c.status !== status) return false
    if (space !== 'all' && c.space !== space) return false
    if (types.size > 0 && !types.has(c.type)) return false
    if (search.trim() && !c.title.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  }), [status, space, types, search])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadingMore(true)
        setTimeout(() => {
          setVisibleCount(v => v + PAGE_SIZE)
          setLoadingMore(false)
        }, 500)
      }
    }, { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore])

  const statusCounts = {
    all: CONCEPTS.length,
    new: CONCEPTS.filter(c => c.status === 'new').length,
    improved: CONCEPTS.filter(c => c.status === 'improved').length,
  }
  const spaceCounts: Record<string, number> = { all: CONCEPTS.length }
  CONCEPT_SPACES.forEach(s => { spaceCounts[s] = CONCEPTS.filter(c => c.space === s).length })
  const typeCounts: Record<string, number> = {}
  CONCEPT_TYPES.forEach(t => { typeCounts[t] = CONCEPTS.filter(c => c.type === t).length })

  const visibleTypeList = CONCEPT_TYPES.filter(t => t.toLowerCase().includes(typeSearch.trim().toLowerCase()))
  const quickPills: ('all' | ConceptType)[] = ['all', ...CONCEPT_TYPES]
  const pillsRowRef = useRef<HTMLDivElement>(null)
  const scrollPills = () => pillsRowRef.current?.scrollBy({ left: 260, behavior: 'smooth' })

  const clearAll = () => {
    setStatus('all'); setSpace('all'); setTypes(new Set()); setSearch(''); setTypeSearch(''); setVisibleCount(PAGE_SIZE)
  }

  const FiltersPanel = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F2F2F2',
        }}>Filters</span>
        <button
          onClick={clearAll}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {RefreshIcon}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: GOLD }}>Clear All</span>
        </button>
      </div>

      <FilterGroup title="Concept Status">
        <RadioRow label="All Status" count={statusCounts.all} active={status === 'all'} onClick={() => setStatus('all')} />
        <RadioRow label="New Concepts" count={statusCounts.new} active={status === 'new'} onClick={() => setStatus('new')} />
        <RadioRow label="Improved Concepts" count={statusCounts.improved} active={status === 'improved'} onClick={() => setStatus('improved')} />
      </FilterGroup>

      <FilterGroup title="Industry">
        <RadioRow label="All" count={spaceCounts.all} active={space === 'all'} onClick={() => setSpace('all')} />
        {CONCEPT_SPACES.map(s => (
          <RadioRow key={s} label={s} count={spaceCounts[s]} active={space === s} onClick={() => setSpace(s)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Concept Type">
        <RadioRow label="All Types" count={CONCEPTS.length} active={types.size === 0} onClick={() => setTypes(new Set())} />
        <div style={{ position: 'relative', margin: '10px 0 12px' }}>
          <input
            value={typeSearch} onChange={e => setTypeSearch(e.target.value)}
            placeholder="Search concept types..."
            style={{
              width: '100%', padding: '8px 12px 8px 32px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,175,55,0.25)', borderRadius: 6, color: '#fff', outline: 'none',
              fontFamily: "'Inter', sans-serif", fontSize: 11.5,
            }}
          />
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>{SearchIcon}</div>
        </div>
        <div
          data-lenis-prevent
          className="type-scroll"
          style={{
            maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            paddingRight: 10, scrollbarWidth: 'thin', scrollbarColor: `${GOLD} #0A0A0D`,
          } as React.CSSProperties}
        >
          {visibleTypeList.map(t => (
            <CheckRow key={t} label={t} count={typeCounts[t]} active={types.has(t)} onClick={() => toggleCheckType(t)} />
          ))}
        </div>
      </FilterGroup>
    </div>
  )

  // Background image disabled in favor of a solid black background — uncomment to restore.
  // const bg = "url('/images/all%20concepts%20bg%20desktop.png')"

  return (
    <div
      ref={scrollRef}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: '#000', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* ── Back, on a line beneath the universal site logo ── */}
      <div style={{ padding: isMobile ? '90px 16px 0' : '120px 40px 0' }}>
        <button
          onClick={() => triggerPageOut(() => navigate('/'))}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <MdArrowBack size={12} color={GOLD} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD }}>Back</span>
        </button>
      </div>

      {/* ── Hero banner ── */}
      <div style={{
        position: 'relative', width: '100%',
        // backgroundImage: bg, backgroundSize: 'cover',
        // backgroundPosition: isMobile ? 'top center' : 'center',
        backgroundColor: '#000',
        padding: isMobile ? '20px 20px 40px' : '30px 40px 60px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: isMobile ? 'clamp(36px, 13vw, 48px)' : 'clamp(48px, 5.5vw, 80px)',
          margin: 0, lineHeight: 1.05,
        }}>
          {/* <span style={{ color: '#F2F2F2' }}>{pageContent.headingWhite} </span> */}
          <span style={{ color: GOLD }}>{pageContent.headingGold}</span>
        </h1>
        <StarDivider lineWidth={isMobile ? 45 : 80} style={{ margin: isMobile ? '14px 0' : '20px 0' }} />
        {/* <p style={{
          fontFamily: "'Cinzel', serif", fontSize: isMobile ? 10 : 13, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(237,237,237,0.85)', margin: '0 0 28px',
        }}>
          <RichText text={pageContent.tagline} goldColor={GOLD} />
        </p> */}

        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={pageContent.searchPlaceholder}
              style={{
                width: '100%', padding: isMobile ? '12px 16px 12px 40px' : '15px 20px 15px 46px',
                background: 'rgba(10,10,13,0.6)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 10,
                color: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 13 : 14,
                backdropFilter: 'blur(6px)',
              }}
            />
            <div style={{ position: 'absolute', left: isMobile ? 14 : 18, top: '50%', transform: 'translateY(-50%)' }}>{SearchIcon}</div>
          </div>

          {isMobile && (
            <button
              onClick={() => setFiltersOpen(o => !o)}
              style={{
                width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', background: 'rgba(10,10,13,0.6)', border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: 10, cursor: 'pointer',
              }}
            >
              {SlidersIcon}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: GOLD }}>FILTERS</span>
              <ChevronIcon open={filtersOpen} />
            </button>
          )}

          {isMobile && filtersOpen && (
            <div style={{
              marginTop: 16, textAlign: 'left', padding: '16px 18px', borderRadius: 12,
              border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(8px)',
            }}>
              {FiltersPanel}
            </div>
          )}
        </div>

        {/* Quick-filter pills — one single stretched-full-width line, with a
            circular arrow to reveal the rest instead of wrapping or a visible
            scrollbar (the row still scrolls natively via drag/wheel/arrow). */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, maxWidth: 1400, width: '100%', margin: '16px auto 0' }}>
          <div ref={pillsRowRef} className="pills-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollBehavior: 'smooth', flex: 1, minWidth: 0 }}>
            {quickPills.map(p => {
              const active = p === 'all' ? types.size === 0 : types.size === 1 && types.has(p)
              return (
                <button
                  key={p}
                  onClick={() => togglePillType(p)}
                  style={{
                    flexShrink: 0, whiteSpace: 'nowrap',
                    padding: '8px 16px', borderRadius: 999,
                    border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.2)'}`,
                    background: active ? 'rgba(212,175,55,0.12)' : 'rgba(10,10,13,0.5)',
                    color: active ? GOLD : 'rgba(255,255,255,0.75)',
                    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{p === 'all' ? 'All' : p}</button>
              )
            })}
          </div>
          <button
            onClick={scrollPills}
            aria-label="Show more categories"
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(10,10,13,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <MdChevronRight size={16} color={GOLD} />
          </button>
        </div>

        <style>{`
          .pills-scroll::-webkit-scrollbar { display: none; }
          .pills-scroll { scrollbar-width: none; }
          .type-scroll::-webkit-scrollbar { width: 7px; }
          .type-scroll::-webkit-scrollbar-track { background: #0A0A0D; border-radius: 4px; }
          .type-scroll::-webkit-scrollbar-thumb { background: ${GOLD}; border-radius: 4px; }
          .type-scroll::-webkit-scrollbar-thumb:hover { background: #e8c452; }
        `}</style>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '30px 16px 60px' : '40px 40px 80px' }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          {!isMobile && (
            <div style={{ flex: '0 0 260px', position: 'sticky', top: 100 }}>
              {FiltersPanel}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }} ref={gridRef}>
            {visible.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
                  No concepts match your filters.
                </p>
              </div>
            ) : (
              <div style={{
                display: isMobile ? 'flex' : 'grid',
                flexDirection: isMobile ? 'column' : undefined,
                // auto-fit naturally reduces the column count (4 → 3 → 2) as the
                // viewport narrows, instead of jumping straight from 4 to 1 at
                // the mobile breakpoint — mobile itself keeps the stacked list.
                gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: isMobile ? 14 : 20,
              }}>
                {visible.map((c, i) => (
                  <ConceptCard
                    key={c.id} concept={c} isMobile={isMobile} delay={(i % PAGE_SIZE) * 60} inView={gridInView}
                    onOpen={() => triggerPageOut(() => navigate(`/concepts/${slugify(c.title)}`))}
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(212,175,55,0.25)', borderTopColor: GOLD,
                    animation: loadingMore ? 'conceptsSpin 0.8s linear infinite' : 'none',
                  }} />
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'rgba(237,237,237,0.6)',
                  }}>Loading more concepts...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes conceptsSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
