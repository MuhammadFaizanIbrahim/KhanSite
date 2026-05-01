import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Preloader   from '@/components/ui/Preloader'
import HomePage    from '@/pages/HomePage'
import WorkPage    from '@/pages/WorkPage'
import AboutPage   from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const handlePreloaderComplete = () => {
    // Start reveal: main content blurry + dark, then clears
    setRevealing(true)
    setTimeout(() => setLoaded(true), 1200)  // hold blur before clearing
  }

  return (
    <>
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
            ? 'filter 4.5s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease'
            : 'none',
        }}
      >
        <Routes>
          <Route path="/"        element={<HomePage />}   />
          <Route path="/work"    element={<WorkPage />}   />
          <Route path="/about"   element={<AboutPage />}  />
          <Route path="/contact" element={<ContactPage />}/>
        </Routes>
      </div>
    </>
  )
}