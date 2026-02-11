'use client'

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react'

interface MobileMenuContextType {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  toggleMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])

  const value = useMemo(
    () => ({ isMenuOpen, setIsMenuOpen, toggleMenu }),
    [isMenuOpen, toggleMenu],
  )

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}
