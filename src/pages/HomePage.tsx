import { useRef } from 'react'
import Sidebar                     from '@/components/layout/Sidebar'
import Hero                        from '@/components/sections/Hero'
import WhatIsKhanConcepts          from '@/components/sections/WhatIsKhanConcepts'
import HowWeBringConceptsToReality from '@/components/sections/HowWeBringConceptsToReality'
import ConceptInnovationSpace      from '@/components/sections/ConceptInnovationSpace'
import FeaturedConcepts            from '@/components/sections/FeaturedConcepts'
import Footer                      from '@/components/sections/Footer'
import { useLenis } from '@/hooks/useLenis'

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLenis(scrollRef)

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto overflow-x-hidden">
      <Hero />
      <WhatIsKhanConcepts />
      <HowWeBringConceptsToReality />
      <ConceptInnovationSpace />
      <FeaturedConcepts />
      <Footer />

      <Sidebar />
    </div>
  )
}
