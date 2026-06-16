import { useState, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Preloader             from '@/components/ui/Preloader'
import PageTransitionCanvas  from '@/components/ui/PageTransitionCanvas'
import { TransitionProvider } from '@/contexts/TransitionContext'
import type { PageTransitionHandle } from '@/components/ui/PageTransitionCanvas'
import HomePage     from '@/pages/HomePage'
import WorkPage     from '@/pages/WorkPage'
import AboutPage    from '@/pages/AboutPage'
import ContactPage  from '@/pages/ContactPage'
import ProjectPage  from '@/pages/ProjectPage'
import ConceptsPage from '@/pages/ConceptsPage'

export default function App() {
  const [loaded, setLoaded]       = useState(false)
  const [revealing, setRevealing] = useState(false)
  const transitionRef             = useRef<PageTransitionHandle | null>(null)

  const handlePreloaderComplete = () => {
    setRevealing(true)
    setTimeout(() => {
      setLoaded(true)
      // Fire app:ready after blur has cleared enough for the logo animation to be visible
      setTimeout(() => {
        ;(window as { __appReady?: boolean }).__appReady = true
        window.dispatchEvent(new Event('app:ready'))
      }, 700)
    }, 400)
  }

  return (
    <TransitionProvider canvasRef={transitionRef}>
      {/* Preloader */}
      {!loaded && !revealing && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main app — starts blurry+dark, transitions to clear */}
      <div
        style={{
          width: '100%', height: '100%',
          filter:     loaded ? 'blur(0px) brightness(1) saturate(1)' : 'blur(48px) brightness(0.08) saturate(0)',
          opacity:    revealing || loaded ? 1 : 0,
          transition: loaded
            ? 'filter 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease'
            : 'none',
        }}
      >
        <Routes>
          <Route path="/"          element={<HomePage />}      />
          <Route path="/concepts"  element={<ConceptsPage />}  />
          <Route path="/work"      element={<WorkPage />}      />
          <Route path="/work/:id"  element={<ProjectPage />}   />
          <Route path="/about"     element={<AboutPage />}     />
          <Route path="/contact"   element={<ContactPage />}   />
        </Routes>
      </div>

      {/* Root-level transition canvas — above blur wrapper so it never gets filtered */}
      <PageTransitionCanvas ref={transitionRef} />
    </TransitionProvider>
  )
}