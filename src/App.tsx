import { useState, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Preloader             from '@/components/ui/Preloader'
import PageTransitionCanvas  from '@/components/ui/PageTransitionCanvas'
import CustomCursor          from '@/components/ui/CustomCursor'
import Navbar                from '@/components/layout/Navbar'
import CenterNav             from '@/components/layout/CenterNav'
import { TransitionProvider } from '@/contexts/TransitionContext'
import type { PageTransitionHandle } from '@/components/ui/PageTransitionCanvas'
import HomePage           from '@/pages/HomePage'
import WorkPage           from '@/pages/WorkPage'
import AboutPage          from '@/pages/AboutPage'
import ContactPage        from '@/pages/ContactPage'
import ProjectPage        from '@/pages/ProjectPage'
import ConceptsPage       from '@/pages/ConceptsPage'
import ConceptDetailPage  from '@/pages/ConceptDetailPage'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const transitionRef       = useRef<PageTransitionHandle | null>(null)

  const handlePreloaderComplete = () => {
    // Hand off to the same noise-dissolve effect used between pages, dissolving
    // the preloader's own background image instead of the destination page's.
    transitionRef.current?.play(() => {
      setLoaded(true)
      ;(window as { __appReady?: boolean }).__appReady = true
      window.dispatchEvent(new Event('app:ready'))
    }, 'preloader')
  }

  return (
    <TransitionProvider canvasRef={transitionRef}>
      {/* Preloader */}
      {!loaded && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main app */}
      <div style={{ width: '100%', height: '100%' }}>
        <Routes>
          <Route path="/"             element={<HomePage />}          />
          <Route path="/concepts"     element={<ConceptsPage />}      />
          <Route path="/concepts/:id" element={<ConceptDetailPage />} />
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
