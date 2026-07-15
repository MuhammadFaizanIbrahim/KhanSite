import { useEffect, useRef } from 'react'
import Snap from 'lenis/snap'
import type { VirtualScrollData } from 'lenis'
import Sidebar                     from '@/components/layout/Sidebar'
import Hero                        from '@/components/sections/Hero'
import WhatIsKhanConcepts          from '@/components/sections/WhatIsKhanConcepts'
import HowWeBringConceptsToReality from '@/components/sections/HowWeBringConceptsToReality'
import ConceptInnovationSpace      from '@/components/sections/ConceptInnovationSpace'
import FeaturedConcepts            from '@/components/sections/FeaturedConcepts'
import Footer                      from '@/components/sections/Footer'
import { useLenis } from '@/hooks/useLenis'

// Maps each homepage section's DOM id to the URL hash shown while it's in
// view. Hero has none — the URL hash clears back to just "/" while at the top.
const SECTION_HASHES: { id: string; hash: string }[] = [
  { id: 'what-is-khanconcepts', hash: 'whatiskhanconcepts' },
  { id: 'concept-innovation-space', hash: 'conceptdesignindustries' },
  { id: 'how-we-bring-concepts-to-reality', hash: 'concepttosolutionprocess' },
  { id: 'featured-concepts', hash: 'featuredconcepts' },
  { id: 'footer', hash: 'footer' },
]

// Updates the URL hash to reflect whichever section is currently centered in
// the viewport, using history.replaceState so it never adds to browser
// history or triggers a React Router navigation/scroll jump.
function useSectionHashSpy() {
  useEffect(() => {
    const elements = SECTION_HASHES
      .map(s => ({ ...s, el: document.getElementById(s.id) }))
      .filter((s): s is typeof s & { el: HTMLElement } => s.el !== null)

    // Tracks intersection state per element (IntersectionObserver only reports
    // entries whose state just changed, not every observed element), so we can
    // tell "nothing is intersecting" (e.g. back at Hero, above the first
    // tracked section) apart from "no change this callback".
    const isIntersecting = new Map<Element, boolean>()

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => isIntersecting.set(e.target, e.isIntersecting))
        const visible = elements.filter(s => isIntersecting.get(s.el))

        let nextHash = ''
        if (visible.length > 0) {
          const centered = visible.reduce((a, b) => {
            const rectA = a.el.getBoundingClientRect()
            const rectB = b.el.getBoundingClientRect()
            return Math.abs(rectA.top) < Math.abs(rectB.top) ? a : b
          })
          nextHash = `#${centered.hash}`
        }

        const nextUrl = nextHash ? nextHash : window.location.pathname + window.location.search
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, '', nextUrl)
        }
      },
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
    )
    elements.forEach(s => io.observe(s.el))
    return () => io.disconnect()
  }, [])
}

// "What Is KhanConcepts" is short enough that a fast scroll can blow right
// past it — proximity-snapping just this one section means a scroll that
// lands anywhere near it eases into alignment, without affecting scrolling
// anywhere else on the page (other sections aren't registered as snap points).
function useSectionSnap(id: string) {
  useEffect(() => {
    const lenis = window.__lenis
    const el = document.getElementById(id)
    if (!lenis || !el) return

    const snap = new Snap(lenis, { type: 'proximity', duration: 1 })
    const removeElement = snap.addElement(el, { align: 'start' })

    return () => {
      removeElement()
      snap.destroy()
    }
  }, [id])
}

// Proximity-snap only corrects the scroll AFTER it comes to rest, which isn't
// enough if a fast fling's momentum carries straight past the whole section
// before it settles. This dampens the wheel/touch delta in real time for as
// long as any part of the section is on screen, so a fling actually takes
// noticeably more input to clear it — genuine resistance, not just a snap-back.
const RESISTANCE_ZONE_ID = 'what-is-khanconcepts'
const RESISTANCE_FACTOR  = 0.35

function resistScrollThroughSection(data: VirtualScrollData) {
  const el = document.getElementById(RESISTANCE_ZONE_ID)
  if (el) {
    const rect = el.getBoundingClientRect()
    const inZone = rect.top < window.innerHeight && rect.bottom > 0
    if (inZone) data.deltaY *= RESISTANCE_FACTOR
  }
  return true
}

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef, resistScrollThroughSection)
  useSectionHashSpy()
  useSectionSnap('what-is-khanconcepts')

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto overflow-x-hidden">
      <Hero />
      <WhatIsKhanConcepts />
      <ConceptInnovationSpace />
      <HowWeBringConceptsToReality />
      <FeaturedConcepts />
      <Footer />

      <Sidebar />
    </div>
  )
}
