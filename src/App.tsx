import { useState, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Preloader             from '@/components/ui/Preloader'
import GalaxyBackground      from '@/components/ui/GalaxyBackground'
// Previous page-transition effect (WebGL noise dissolve) — kept here, commented
// out, in case the new starfield transition below needs to be reverted.
// import PageTransitionCanvas  from '@/components/ui/PageTransitionCanvas'
// import type { PageTransitionHandle } from '@/components/ui/PageTransitionCanvas'
import PageTransitionCanvas  from '@/components/ui/StarfieldTransitionCanvas'
import type { PageTransitionHandle } from '@/components/ui/StarfieldTransitionCanvas'
import CustomCursor          from '@/components/ui/CustomCursor'
import Navbar                from '@/components/layout/Navbar'
import CenterNav             from '@/components/layout/CenterNav'
import { TransitionProvider } from '@/contexts/TransitionContext'
import HomePage           from '@/pages/HomePage'
import WorkPage           from '@/pages/WorkPage'
import AboutPage          from '@/pages/AboutPage'
import ContactPage        from '@/pages/ContactPage'
import ProjectPage        from '@/pages/ProjectPage'
import ConceptsPage       from '@/pages/ConceptsPage'
import ConceptDetailPage  from '@/pages/ConceptDetailPage'

// Preloader → Homepage handoff uses a cinematic blur-to-focus reveal instead of
// the WebGL noise-dissolve — the dissolve stays exactly as-is for every other
// in-app navigation (see TransitionContext/triggerPageOut, untouched below).
const CINEMATIC_FOCUS_MS = 1300

export default function App() {
  const [loaded, setLoaded]                 = useState(false)
  const [cinematicFocus, setCinematicFocus] = useState(false)
  const transitionRef       = useRef<PageTransitionHandle | null>(null)

  const handlePreloaderComplete = () => {
    setLoaded(true)
    ;(window as { __appReady?: boolean }).__appReady = true
    window.dispatchEvent(new Event('app:ready'))
    // Render one frame still blurred, then rack into focus — a `requestAnimationFrame`
    // gap is needed so the CSS transition actually has a "from" state to animate away from.
    requestAnimationFrame(() => setCinematicFocus(true))
    setTimeout(() => window.dispatchEvent(new Event('transition:done')), CINEMATIC_FOCUS_MS)
  }

  return (
    <TransitionProvider canvasRef={transitionRef}>
      {/* Single shared starfield behind every route — mounted once here rather
          than per-page so there's only ever one WebGL context for it. */}
      <GalaxyBackground />

      {/* Preloader */}
      {!loaded && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main app — blurred + slightly zoomed until the preloader hands off, then racks into focus */}
      <div style={{
        width: '100%', height: '100%',
        filter: cinematicFocus ? 'blur(0px)' : 'blur(26px)',
        transform: cinematicFocus ? 'scale(1)' : 'scale(1.05)',
        transition: `filter ${CINEMATIC_FOCUS_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${CINEMATIC_FOCUS_MS}ms cubic-bezier(0.16,1,0.3,1)`,
      }}>
        <Routes>
          <Route path="/"             element={<HomePage />}          />
          <Route path="/concepts"     element={<ConceptsPage />}      />
          <Route path="/concepts/:slug" element={<ConceptDetailPage />} />
          <Route path="/work"         element={<WorkPage />}          />
          <Route path="/work/:id"     element={<ProjectPage />}       />
          <Route path="/about"        element={<AboutPage />}         />
          <Route path="/contact"      element={<ContactPage />}       />
        </Routes>
      </div>

      {/* Universal top logo + bottom pill nav — persist across every page */}
      <Navbar />
      <CenterNav />

      <PageTransitionCanvas ref={transitionRef} />

      <CustomCursor />
    </TransitionProvider>
  )
}
