import { createContext, useContext, ReactNode } from 'react'
import type { RefObject } from 'react'
import type { PageTransitionHandle } from '@/components/ui/PageTransitionCanvas'

interface TransitionCtx {
  triggerPageOut: (onNavigate: () => void) => void
}

const TransitionContext = createContext<TransitionCtx>({ triggerPageOut: cb => cb() })

export function usePageTransition() {
  return useContext(TransitionContext)
}

export function TransitionProvider({
  children,
  canvasRef,
}: {
  children: ReactNode
  canvasRef: RefObject<PageTransitionHandle | null>
}) {
  const triggerPageOut = (onNavigate: () => void) => {
    canvasRef.current ? canvasRef.current.play(onNavigate) : onNavigate()
  }

  return (
    <TransitionContext.Provider value={{ triggerPageOut }}>
      {children}
    </TransitionContext.Provider>
  )
}
