import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Preloader  from '@/components/ui/Preloader'
import HomePage   from '@/pages/HomePage'
import WorkPage   from '@/pages/WorkPage'
import AboutPage  from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {/* Preloader — sits on top until assets are ready */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      {/* Main app — renders underneath preloader, fades in when preloader exits */}
      <div className={`w-full h-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
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
