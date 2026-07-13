import { useEffect, useRef } from 'react'
import GalaxyBackground            from '@/components/ui/GalaxyBackground'
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

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)
  useSectionHashSpy()

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto overflow-x-hidden">
      <GalaxyBackground />

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
