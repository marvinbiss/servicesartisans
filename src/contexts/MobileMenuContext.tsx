'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  toggleMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(prev => !prev)

  return (
    <MobileMenuContext.Provider value={{ isMenuOpen, setIsMenuOpen, toggleMenu }}>
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
